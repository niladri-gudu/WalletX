import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const PAYMASTER = "0x006C257C7d4AB9c6f6f78d1593F9aFB4aFDa1685";

async function main() {
  const signer = await client.readContract({
    address: PAYMASTER,
    abi: [
      {
        name: 'verifyingSigner',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'address' }],
      },
    ],
    functionName: 'verifyingSigner',
  });

  console.log("🔹 verifyingSigner (on-chain):", signer);
}

main();