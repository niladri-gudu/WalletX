import { createWalletClient, http, parseEther, encodeFunctionData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import 'dotenv/config'

const account = privateKeyToAccount(process.env.OWNER_PRIVATE_KEY as `0x${string}`);

const client = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
});

async function main() {
  const data = encodeFunctionData({
    abi: [
      {
        name: 'deposit',
        type: 'function',
        stateMutability: 'payable',
        inputs: [],
        outputs: [],
      },
    ],
    functionName: 'deposit',
  });

  await client.sendTransaction({
    to: process.env.PAYMASTER_ADDRESS as `0x${string}`,
    value: parseEther('0.05'),
    data,
  });

  console.log('✅ Paymaster funded');
}

main();
