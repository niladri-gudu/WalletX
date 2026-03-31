export type SessionKeyData = {
  privateKey: `0x${string}`;
  address: `0x${string}`;
  allowedTarget: `0x${string}`;
  maxAmount: bigint;
  validUntil: number;
};