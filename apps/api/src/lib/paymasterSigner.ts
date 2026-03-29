import { privateKeyToAccount } from 'viem/accounts';

export const paymasterSigner = privateKeyToAccount(
  process.env.PAYMASTER_PRIVATE_KEY as `0x${string}`,
);
