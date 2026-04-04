import { Injectable } from '@nestjs/common';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { createWalletClient, http, publicActions } from 'viem';
import { sepolia } from 'viem/chains';
import { SessionKeyData } from './session.types.js';

const SMART_WALLET = process.env.SMART_WALLET as `0x${string}`;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY as `0x${string}`;

const SMART_WALLET_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Executed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'validUntil',
        type: 'uint256',
      },
    ],
    name: 'SessionKeyAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
    ],
    name: 'SessionKeyRevoked',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'allowedTarget',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'maxAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'validUntil',
        type: 'uint256',
      },
    ],
    name: 'addSessionKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'key',
        type: 'address',
      },
    ],
    name: 'revokeSessionKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'bytes32',
            name: 'accountGasLimits',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'gasFees',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'paymasterAndData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct SmartWallet.PackedUserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'userOpHash',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'missingAccountFunds',
        type: 'uint256',
      },
    ],
    name: 'validateUserOp',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_entryPoint',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'entryPoint',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nonce',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'sessionKeys',
    outputs: [
      {
        internalType: 'address',
        name: 'allowedTarget',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'maxAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'validUntil',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'active',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const sessionStore = new Map<string, SessionKeyData>();

@Injectable()
export class SessionService {
  private walletClient = createWalletClient({
    account: privateKeyToAccount(OWNER_PRIVATE_KEY),
    chain: sepolia,
    transport: http(process.env.RPC_URL),
  }).extend(publicActions);

  async createSession(
    allowedTarget: `0x${string}`,
    maxAmount: bigint,
    durationSeconds: number,
  ) {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const validUntil = Math.floor(Date.now() / 1000) + durationSeconds;

    if (!allowedTarget || !allowedTarget.startsWith('0x')) {
      throw new Error('Invalid target address');
    }

    console.log('🔑 New session key:', account.address);
    console.log('🎯 Allowed target:', allowedTarget);
    console.log('💰 Max amount:', maxAmount.toString());
    console.log('⏰ Valid until:', new Date(validUntil * 1000).toISOString());

    const hash = await this.walletClient.writeContract({
      address: SMART_WALLET,
      abi: SMART_WALLET_ABI,
      functionName: 'addSessionKey',
      args: [account.address, allowedTarget, maxAmount, BigInt(validUntil)],
    });

    console.log('📝 addSessionKey tx:', hash);

    await this.walletClient.waitForTransactionReceipt({ hash });
    console.log('✅ Session key registered on-chain');

    const sessionData: SessionKeyData = {
      privateKey,
      address: account.address,
      allowedTarget,
      maxAmount,
      validUntil,
    };
    sessionStore.set(account.address, sessionData);

    return {
      sessionKeyAddress: account.address,
      allowedTarget,
      maxAmount: maxAmount.toString(),
      validUntil,
      expiresAt: new Date(validUntil * 1000).toISOString(),
    };
  }

  async revokeSession(sessionKeyAddress: `0x${string}`) {
    const hash = await this.walletClient.writeContract({
      address: SMART_WALLET,
      abi: SMART_WALLET_ABI,
      functionName: 'revokeSessionKey',
      args: [sessionKeyAddress],
    });

    await this.walletClient.waitForTransactionReceipt({ hash });
    sessionStore.delete(sessionKeyAddress);

    console.log('🗑️ Session key revoked:', sessionKeyAddress);
    return { revoked: true, sessionKeyAddress };
  }

  getSession(sessionKeyAddress: `0x${string}`) {
    return sessionStore.get(sessionKeyAddress);
  }

  getAllSessions() {
    return Array.from(sessionStore.values()).map((s) => ({
      address: s.address,
      allowedTarget: s.allowedTarget,
      maxAmount: s.maxAmount.toString(),
      validUntil: s.validUntil,
      expiresAt: new Date(s.validUntil * 1000).toISOString(),
      expired: Date.now() / 1000 > s.validUntil,
    }));
  }
}
