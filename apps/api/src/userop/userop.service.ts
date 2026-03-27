import { Injectable } from '@nestjs/common';
import { publicClient } from '../blockchain/viem.client';
import { buildCallData, buildUserOp } from './userop.builder';
import { getUserOpHash, signUserOp } from './userop.signer';
import { sendUserOp } from './userop.sender';

@Injectable()
export class UseropService {
  async sendETH(wallet: `0x${string}`, to: `0x${string}`, amount: bigint) {
    const nonce = await publicClient.readContract({
      address: wallet,
      abi: [
        {
          name: 'nonce',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ],
      functionName: 'nonce',
    });

    const calldata = buildCallData(to, amount, '0x');

    const userOp = buildUserOp(wallet, nonce, calldata);

    const hash = getUserOpHash(userOp);

    const signature = await signUserOp(hash);

    userOp.signature = signature;

    return await sendUserOp(userOp);
  }
}
