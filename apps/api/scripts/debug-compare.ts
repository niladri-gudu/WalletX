import 'dotenv/config';
import { createPublicClient, http, keccak256, encodePacked } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS as `0x${string}`;
const CHAIN_ID = 11155111n;

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});

// The ABI for computeHash — add this function to your deployed contract
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
          { name: 'sender',               type: 'address' },
          { name: 'nonce',                type: 'uint256' },
          { name: 'initCode',             type: 'bytes'   },
          { name: 'callData',             type: 'bytes'   },
          { name: 'callGasLimit',         type: 'uint256' },
          { name: 'verificationGasLimit', type: 'uint256' },
          { name: 'preVerificationGas',   type: 'uint256' },
          { name: 'maxFeePerGas',         type: 'uint256' },
          { name: 'maxPriorityFeePerGas', type: 'uint256' },
          { name: 'paymasterAndData',     type: 'bytes'   },
          { name: 'signature',            type: 'bytes'   },
        ],
      },
    ],
    outputs: [
      { name: 'rawHash',   type: 'bytes32' },
      { name: 'finalHash', type: 'bytes32' },
    ],
  },
  {
    name: 'verifyingSigner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const;

async function main() {
  // ── Step 1: check verifyingSigner stored in contract ──────────────────────
  const storedSigner = await client.readContract({
    address: PAYMASTER_ADDRESS,
    abi: PAYMASTER_ABI,
    functionName: 'verifyingSigner',
  });
  console.log('verifyingSigner in contract  :', storedSigner);

  const paymasterSigner = privateKeyToAccount(process.env.PAYMASTER_PRIVATE_KEY as `0x${string}`);
  console.log('paymasterSigner from .env    :', paymasterSigner.address);
  console.log('Match:', storedSigner.toLowerCase() === paymasterSigner.address.toLowerCase());
  console.log('');

  // ── Step 2: build the same userOp your service builds ─────────────────────
  const userOp = {
    sender:               '0x4e796c6Ecc9b59759389cD29DfCa17fdbd806CF2' as `0x${string}`,
    nonce:                0n,
    initCode:             '0x' as `0x${string}`,
    callData:             '0x' as `0x${string}`,       // ← use real calldata if you have it
    callGasLimit:         150000n,
    verificationGasLimit: 200000n,
    preVerificationGas:   60000n,
    maxFeePerGas:         20000000000n,
    maxPriorityFeePerGas: 1000000000n,
    paymasterAndData:     '0x' as `0x${string}`,
    signature:            '0x' as `0x${string}`,
  };

  // ── Step 3: compute hash locally (what paymaster.ts signs) ────────────────
  const localRawHash = keccak256(
    encodePacked(
      ['address','uint256','bytes32','bytes32','uint256','uint256','uint256','address','uint256'] as const,
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
      ]
    )
  );
  console.log('Local rawHash  :', localRawHash);

  // ── Step 4: call contract's computeHash with same userOp ──────────────────
  // NOTE: this requires you to add computeHash() to your deployed contract.
  // If not deployed yet, comment this block out and just compare the signer addresses above.
  try {
    const [contractRawHash, contractFinalHash] = await client.readContract({
      address: PAYMASTER_ADDRESS,
      abi: PAYMASTER_ABI,
      functionName: 'computeHash',
      args: [userOp],
    });
    console.log('Contract rawHash:', contractRawHash);
    console.log('');
    console.log('Hashes match:', localRawHash === contractRawHash);
    console.log('Contract finalHash:', contractFinalHash);
  } catch (e) {
    console.log('computeHash not available on contract (add it and redeploy to use this check)');
    console.log('');
    console.log('⚠️  For now, just check if signer addresses match above.');
  }
}

main().catch(console.error);