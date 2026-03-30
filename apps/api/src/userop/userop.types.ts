export type UserOperation = {
  sender: `0x${string}`;
  nonce: bigint;

  factory: `0x${string}` | null;
  factoryData: `0x${string}` | null;

  callData: `0x${string}`;

  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;

  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;

  // ✅ FIX HERE
  paymaster: `0x${string}` | null;
  paymasterVerificationGasLimit: bigint;
  paymasterPostOpGasLimit: bigint;
  paymasterData: `0x${string}` | null;

  signature: `0x${string}`;
};
