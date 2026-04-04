/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { publicClient } from '../blockchain/viem.client.js';
import { buildCallData, buildUserOp } from './userop.builder.js';
import { getUserOpHash, signUserOp } from './userop.signer.js';
import { sendUserOp } from './userop.sender.js';
import { getPaymasterData } from '../lib/paymaster.js';
import { PAYMASTER_ADDRESS } from '../config/constants.js';
import { SessionService } from '../session/session.service.js';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

@Injectable()
export class UseropService {
  constructor(private readonly sessionService: SessionService) {}

  private bundlerClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.BUNDLER_URL),
  });

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

    console.log('🔵 hashForPaymaster:', hashForPaymaster);
    console.log('🔵 paymasterData:', await getPaymasterData(hashForPaymaster));

    // Simulate what contract does
    const { recoverAddress, keccak256, encodePacked } = await import('viem');
    const sig = await getPaymasterData(hashForPaymaster);

    // Contract uses: ecrecover(userOpHash, v, r, s) — NO prefix
    const recovered1 = await recoverAddress({
      hash: hashForPaymaster,
      signature: sig,
    });
    console.log('🔵 recovered (no prefix)  :', recovered1);

    // Or with prefix
    const ethHash = keccak256(
      encodePacked(
        ['string', 'bytes32'],
        ['\x19Ethereum Signed Message:\n32', hashForPaymaster],
      ),
    );
    const recovered2 = await recoverAddress({ hash: ethHash, signature: sig });
    console.log('🔵 recovered (with prefix):', recovered2);
    console.log(
      '🔵 expected               :',
      '0xCD3fe88a6675A05d5cC0EC6CF4357eC1Cec7152e',
    );

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

  async getUserOpStatus(txHash: `0x${string}`) {
    try {
      const receipt = (await this.bundlerClient.request({
        method: 'eth_getUserOperationReceipt' as any,
        params: [txHash],
      })) as any;

      if (!receipt) {
        return { status: 'pending' };
      }

      if (receipt && receipt.success === false) {
        return { status: 'failed' };
      }

      return { status: 'confirmed', txHash: receipt.receipt.transactionHash };
    } catch (error) {
      return { status: 'pending' };
    }
  }
}
