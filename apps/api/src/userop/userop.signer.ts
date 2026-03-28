/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { walletClient } from '../blockchain/viem.client.js';
import { getUserOperationHash } from 'viem/account-abstraction';
import { hexToBytes } from 'viem';

const ENTRY_POINT = process.env.ENTRY_POINT as `0x${string}`;
const CHAIN_ID = 11155111;

export function getUserOpHash(userOp: any) {
  return getUserOperationHash({
    userOperation: userOp,
    entryPointAddress: ENTRY_POINT,
    chainId: CHAIN_ID,
    entryPointVersion: '0.9',
  });
}

export async function signUserOp(hash: `0x${string}`) {
  return await walletClient.signMessage({
    message: { raw: hexToBytes(hash) },
  });
}
