/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { publicClient } from '../blockchain/viem.client.js';
import { buildCallData, buildUserOp } from './userop.builder.js';
import { getUserOpHash, signUserOp } from './userop.signer.js';
import { sendUserOp } from './userop.sender.js';
import { getPaymasterData } from '../lib/paymaster.js';
import { PAYMASTER_ADDRESS } from '../config/constants.js';

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

    userOp.paymaster = PAYMASTER_ADDRESS;
    userOp.paymasterVerificationGasLimit = 100000n;
    userOp.paymasterPostOpGasLimit = 50000n;
    userOp.paymasterData = '0x';

    const hashForPaymaster = getUserOpHash(userOp);
    userOp.paymasterData = await getPaymasterData(hashForPaymaster);

    const hashForWallet = getUserOpHash(userOp);
    userOp.signature = await signUserOp(hashForWallet);

    return await sendUserOp(userOp);
  }
}
