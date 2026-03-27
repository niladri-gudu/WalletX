export type UserOperation = {
  sender: `0x${string}`;
  nonce: bigint;
  callData: `0x${string}`;
  signature: `0x${string}`;
};
