import { Injectable } from '@nestjs/common';
import { publicClient } from '../blockchain/viem.client.js';
import { buildCallData, buildUserOp } from './userop.builder.js';
import { getUserOpHash, signUserOp } from './userop.signer.js';
import { sendUserOp } from './userop.sender.js';
import { getPaymasterData } from '../lib/paymaster.js';
import { PAYMASTER_ADDRESS } from '../config/constants.js';
import { SessionService } from '../session/session.service.js';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class UseropService {
  constructor(private readonly sessionService: SessionService) {}

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

  async sendWithSessionKey(
    wallet: `0x${string}`,
    to: `0x${string}`,
    amount: bigint,
    sessionKeyAddress: `0x${string}`,
  ) {
    const sessionData = this.sessionService.getSession(sessionKeyAddress);
    if (!sessionData) throw new Error('Session key not found');
    if (Date.now() / 1000 > sessionData.validUntil)
      throw new Error('Session key expired');

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
    const sessionAccount = privateKeyToAccount(sessionData.privateKey);
    userOp.signature = await sessionAccount.signMessage({
      message: { raw: hashForWallet },
    });

    return await sendUserOp(userOp);
  }
}
