export type UserOperation = {
  sender: `0x${string}`;
  nonce: bigint;

  initCode: `0x${string}`;
  callData: `0x${string}`;

  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;

  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;

  paymasterAndData: `0x${string}`;

  signature: `0x${string}`;
};
