import { recoverAddress } from 'viem';

const hash = 'PASTE_userOpHash_here';
const signature = 'PASTE_signature_here';

async function main() {
  const recovered = await recoverAddress({
    hash,
    signature,
  });

  console.log('🔹 recovered address:', recovered);
}

main();
