import { keccak256, encodePacked } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// ── paste your actual values here ──────────────────────────────────────────
const PAYMASTER_PRIVATE_KEY =
  '0xc4a1d9eaf8576c93672a550568f974a2f755eb50a1d23dbbdb538ad99de64618' as `0x${string}`;
const PAYMASTER_ADDRESS =
  '0x686EaD8126CeCE92a9Aed559fcdADcE4Ac2E69E0' as `0x${string}`;
const CHAIN_ID = 11155111n;

// A fake but realistic userOp to test with
const userOp = {
  sender: '0x8ebB942920950c1A04E7373A904e6f13F067d00a' as `0x${string}`,
  nonce: 0n,
  initCode: '0x' as `0x${string}`,
  callData: '0xabcdef' as `0x${string}`,
  callGasLimit: 150000n,
  verificationGasLimit: 200000n,
  preVerificationGas: 60000n,
  maxFeePerGas: 20000000000n,
  maxPriorityFeePerGas: 1000000000n,
};
// ───────────────────────────────────────────────────────────────────────────

async function main() {
  const signer = privateKeyToAccount(PAYMASTER_PRIVATE_KEY);
  console.log('Paymaster signer address:', signer.address);
  console.log('');

  // 1. Show each field and its type going into the hash
  const fields = {
    sender: userOp.sender,
    nonce: userOp.nonce,
    initCodeHash: keccak256(userOp.initCode),
    callDataHash: keccak256(userOp.callData),
    callGasLimit: userOp.callGasLimit,
    verificationGasLimit: userOp.verificationGasLimit,
    preVerificationGas: userOp.preVerificationGas,
    maxFeePerGas: userOp.maxFeePerGas,
    maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
    paymasterAddress: PAYMASTER_ADDRESS,
    chainId: CHAIN_ID,
  };

  console.log('Fields being hashed:');
  console.log(
    JSON.stringify(
      fields,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      2,
    ),
  );
  console.log('');

  // 2. Compute rawHash
  const rawHash = keccak256(
    encodePacked(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'uint256',
      ],
      [
        userOp.sender,
        userOp.nonce,
        keccak256(userOp.initCode),
        keccak256(userOp.callData),
        userOp.callGasLimit,
        userOp.verificationGasLimit,
        userOp.preVerificationGas,
        userOp.maxFeePerGas,
        userOp.maxPriorityFeePerGas,
        PAYMASTER_ADDRESS,
        CHAIN_ID,
      ],
    ),
  );
  console.log('rawHash (before prefix):', rawHash);

  // 3. signMessage adds \x19Ethereum Signed Message:\n32 prefix internally
  const signature = await signer.signMessage({ message: { raw: rawHash } });
  console.log('signature:', signature);
  console.log('signature length (bytes):', (signature.length - 2) / 2); // should be 65

  // 4. Show paymasterAndData
  const paymasterAndData = (PAYMASTER_ADDRESS +
    signature.slice(2)) as `0x${string}`;
  console.log('');
  console.log('paymasterAndData:', paymasterAndData);
  console.log(
    'paymasterAndData length (bytes):',
    (paymasterAndData.length - 2) / 2,
  ); // should be 85 (20 + 65)

  // 5. Verify the signature locally (simulates what Solidity does)
  const prefixedHash = keccak256(
    encodePacked(
      ['string', 'bytes32'],
      ['\x19Ethereum Signed Message:\n32', rawHash],
    ),
  );
  console.log('');
  console.log('prefixedHash (what Solidity ecrecover sees):', prefixedHash);

  // Check: can we recover the signer from the signature?
  // viem's verifyMessage does this automatically
  const { createPublicClient, http } = await import('viem');
  const { sepolia } = await import('viem/chains');
  const client = createPublicClient({ chain: sepolia, transport: http() });

  const valid = await client.verifyMessage({
    address: signer.address,
    message: { raw: rawHash },
    signature,
  });
  console.log('');
  console.log('✅ Signature verifies locally:', valid);
  if (!valid) {
    console.log(
      '❌ Local verification failed — something is wrong with signing itself',
    );
  }
}

main().catch(console.error);
