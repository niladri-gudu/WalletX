import { keccak256, encodeAbiParameters, hexToBytes } from 'viem';
import { walletClient } from '../blockchain/viem.client';
import { UserOperation } from './userop.types';

export function getUserOpHash(userOp: UserOperation) {
  const encoded = encodeAbiParameters(
    [{ type: 'address' }, { type: 'uint256' }, { type: 'bytes' }],
    [userOp.sender, userOp.nonce, userOp.callData],
  );

  return keccak256(encoded);
}

export async function signUserOp(hash: `0x${string}`) {
  return await walletClient.signMessage({
    message: { raw: hexToBytes(hash) },
  });
}
