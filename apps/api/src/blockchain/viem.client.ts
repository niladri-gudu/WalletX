import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const account = privateKeyToAccount(PRIVATE_KEY);

export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URL),
});
