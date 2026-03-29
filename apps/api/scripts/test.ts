// check.ts
import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
});

async function main() {
  const address = '0x4e796c6Ecc9b59759389cD29DfCa17fdbd806CF2';
  
  const code = await client.getBytecode({ address });
  const balance = await client.getBalance({ address });

  console.log('bytecode:', code);
  console.log('has code:', !!code && code !== '0x');
  console.log('balance:', balance.toString());
}

main().catch(console.error);