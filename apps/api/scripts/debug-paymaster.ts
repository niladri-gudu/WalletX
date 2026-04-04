import { privateKeyToAccount } from "viem/accounts";
import 'dotenv/config';

const acc = privateKeyToAccount(process.env.PAYMASTER_PRIVATE_KEY);
console.log("PAYMASTER SIGNER:", acc.address);