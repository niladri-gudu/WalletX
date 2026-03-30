import { privateKeyToAccount } from 'viem/accounts';

const PRIVATE_KEY = process.env.PAYMASTER_PRIVATE_KEY as `0x${string}`;

export async function getPaymasterData(
  userOpHash: `0x${string}`,
): Promise<`0x${string}`> {
  const account = privateKeyToAccount(PRIVATE_KEY);
  return await account.sign({ hash: userOpHash });
}
