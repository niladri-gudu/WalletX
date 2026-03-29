import { Injectable } from '@nestjs/common';
import { publicClient } from '../blockchain/viem.client.js';
import { buildCallData, buildUserOp } from './userop.builder.js';
import { getUserOpHash, signUserOp } from './userop.signer.js';
import { sendUserOp } from './userop.sender.js';
import { getPaymasterDataFromHash } from '../lib/paymaster.js';

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

    userOp.paymasterAndData = await getPaymasterDataFromHash(userOp);

    const finalHash = getUserOpHash(userOp);
    userOp.signature = await signUserOp(finalHash);

    return await sendUserOp(userOp);
  }
}
