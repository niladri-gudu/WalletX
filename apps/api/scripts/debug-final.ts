import 'dotenv/config';
import { createPublicClient, http, keccak256, encodePacked } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { recoverMessageAddress } from 'viem';

const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS as `0x${string}`;
const CHAIN_ID = 11155111n;

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});

const PAYMASTER_ABI = [
  {
    name: 'computeHash',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'userOp',
        type: 'tuple',
        components: [
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'initCode', type: 'bytes' },
          { name: 'callData', type: 'bytes' },
          { name: 'callGasLimit', type: 'uint256' },
          { name: 'verificationGasLimit', type: 'uint256' },
          { name: 'preVerificationGas', type: 'uint256' },
          { name: 'maxFeePerGas', type: 'uint256' },
          { name: 'maxPriorityFeePerGas', type: 'uint256' },
          { name: 'paymasterAndData', type: 'bytes' },
          { name: 'signature', type: 'bytes' },
        ],
      },
    ],
    outputs: [
      { name: 'rawHash', type: 'bytes32' },
      { name: 'finalHash', type: 'bytes32' },
    ],
  },
] as const;

async function main() {
  const paymasterSigner = privateKeyToAccount(
    process.env.PAYMASTER_PRIVATE_KEY as `0x${string}`,
  );

  // ── Exact userOp from your logs ────────────────────────────────────────────
  const userOp = {
    sender: '0x4e796c6Ecc9b59759389cD29DfCa17fdbd806CF2' as `0x${string}`,
    nonce: 0n,
    initCode: '0x' as `0x${string}`,
    callData:
      '0xb61d27f6000000000000000000000000bc36e3176bcda3222127f7e4e3558160fe4ddb11000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
    callGasLimit: 0x249f0n,
    verificationGasLimit: 0x30d40n,
    preVerificationGas: 0xea60n,
    maxFeePerGas: 0x4a817c800n,
    maxPriorityFeePerGas: 0x3b9aca00n,
    paymasterAndData: '0x' as `0x${string}`, // empty — this is what you sign BEFORE setting it
    signature: '0x' as `0x${string}`,
  };

  // ── 1. What your backend hashes and signs ─────────────────────────────────
  const localRawHash = keccak256(
    encodePacked(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'uint256',
      ] as const,
      [
        userOp.sender,
        userOp.nonce,
        keccak256(userOp.initCode),
        keccak256(userOp.callData),
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        PAYMASTER_ADDRESS,
        CHAIN_ID,
      ],
    ),
  );

  const localSignature = await paymasterSigner.signMessage({
    message: { raw: localRawHash },
  });
  const paymasterAndData = (PAYMASTER_ADDRESS +
    localSignature.slice(2)) as `0x${string}`;

  console.log('Local rawHash (signed by backend):', localRawHash);
  console.log('Signature:', localSignature);
  console.log('paymasterAndData:', paymasterAndData);
  console.log('');

  const recovered = await recoverMessageAddress({
    message: { raw: localRawHash },
    signature: localSignature,
  });

  console.log('Recovered address:', recovered);
  console.log('Expected signer  :', paymasterSigner.address);
  console.log(
    'Match:',
    recovered.toLowerCase() === paymasterSigner.address.toLowerCase(),
  );

  // ── 2. What the contract computes with paymasterAndData = '0x' ────────────
  console.log(
    '--- Contract hash with paymasterAndData = 0x (what you signed) ---',
  );
  const [hash1] = await client.readContract({
    address: PAYMASTER_ADDRESS,
    abi: PAYMASTER_ABI,
    functionName: 'computeHash',
    args: [{ ...userOp, paymasterAndData: '0x' }],
  });
  console.log('Contract rawHash (paymasterAndData=0x):', hash1);
  console.log('Match:', localRawHash === hash1);
  console.log('');

  // ── 3. What the contract computes with paymasterAndData filled in ──────────
  // This is what the EntryPoint actually calls validatePaymasterUserOp with
  console.log(
    '--- Contract hash with paymasterAndData filled in (what EntryPoint sees) ---',
  );
  const [hash2] = await client.readContract({
    address: PAYMASTER_ADDRESS,
    abi: PAYMASTER_ABI,
    functionName: 'computeHash',
    args: [{ ...userOp, paymasterAndData }],
  });
  console.log('Contract rawHash (paymasterAndData filled):', hash2);
  console.log('Match with localRawHash:', localRawHash === hash2);
  console.log('');

  // ── 4. Conclusion ──────────────────────────────────────────────────────────
  if (localRawHash === hash1 && localRawHash !== hash2) {
    console.log('🔴 ROOT CAUSE FOUND:');
    console.log(
      '   The contract includes paymasterAndData in its hash computation.',
    );
    console.log(
      '   You sign with paymasterAndData=0x, but EntryPoint calls validatePaymasterUserOp',
    );
    console.log(
      '   with paymasterAndData already filled — so the hashes never match.',
    );
    console.log('');
    console.log(
      '   FIX: In validatePaymasterUserOp, use the userOpHash param directly',
    );
    console.log(
      '   (which the EntryPoint computes from the full userOp), instead of',
    );
    console.log('   recomputing the hash manually from userOp fields.');
  } else if (localRawHash === hash1 && localRawHash === hash2) {
    console.log(
      '✅ Hashes match in both cases — issue is elsewhere (v value, signer mismatch)',
    );
  } else {
    console.log(
      '🔴 Hashes do not match even with paymasterAndData=0x — field encoding mismatch',
    );
  }
}

main().catch(console.error);
