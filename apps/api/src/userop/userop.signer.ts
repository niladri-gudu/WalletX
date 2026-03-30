/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getUserOperationHash } from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const ENTRY_POINT = process.env.ENTRY_POINT as `0x${string}`;
const CHAIN_ID = 11155111;

export function getUserOpHash(userOp: any) {
  return getUserOperationHash({
    userOperation: userOp,
    entryPointAddress: ENTRY_POINT,
    chainId: CHAIN_ID,
    entryPointVersion: '0.7',
  });
}

export async function signUserOp(userOpHash: `0x${string}`) {
  return await account.signMessage({
    message: { raw: userOpHash },
  });
}
