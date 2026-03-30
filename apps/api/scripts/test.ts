// quick check
import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({ chain: sepolia, transport: http(process.env.RPC_URL) });

async function main() {
  const pm = await client.readContract({
    address: process.env.PAYMASTER_ADDRESS as `0x${string}`,
    abi: [{ name: 'entryPoint', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] }],
    functionName: 'entryPoint',
  });
  console.log('Paymaster entryPoint:', pm);
  console.log('Expected:            ', '0x0000000071727De22E5E9d8BAf0edAc6f37da032');
  console.log('Match:', pm.toLowerCase() === '0x0000000071727De22E5E9d8BAf0edAc6f37da032');
}

main().catch(console.error);