/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { publicClient } from '../blockchain/viem.client.js';
import { buildCallData, buildUserOp } from './userop.builder.js';
import { getUserOpHash, signUserOp } from './userop.signer.js';
import { sendUserOp } from './userop.sender.js';
import { getPaymasterData } from '../lib/paymaster.js';
import { PAYMASTER_ADDRESS } from '../config/constants.js';
import {
  keccak256,
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  toBytes,
  bytesToHex,
  concat,
  pad,
  numberToHex,
} from 'viem';
import { recoverAddress } from 'viem';

const ENTRY_POINT = process.env.ENTRY_POINT as `0x${string}`;

@Injectable()
export class UseropService {
  async sendETH(wallet: `0x${string}`, to: `0x${string}`, amount: bigint) {
    const verifyingSigner = await publicClient.readContract({
      address: PAYMASTER_ADDRESS,
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
    console.log('📋 contract verifyingSigner:', verifyingSigner);
    console.log(
      '📋 our signer             : 0xa83fD2f3f9a10425C6A9cedD438A648ef83660d3',
    );
    console.log(
      '📋 match:',
      verifyingSigner.toLowerCase() ===
        '0xa83fd2f3f9a10425c6a9cedd438a648ef83660d3',
    );

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

    // Show what viem packs as paymasterAndData when hashing
    const simulatedPaymasterAndData = concat([
      PAYMASTER_ADDRESS,
      pad(numberToHex(userOp.paymasterVerificationGasLimit), { size: 16 }),
      pad(numberToHex(userOp.paymasterPostOpGasLimit), { size: 16 }),
      '0x',
    ]);
    console.log('📦 simulatedPaymasterAndData:', simulatedPaymasterAndData);
    console.log('📦 length bytes:', toBytes(simulatedPaymasterAndData).length);

    userOp.paymasterData = await getPaymasterData(hashForPaymaster);
    console.log('🔵 paymasterData set:', userOp.paymasterData);

    // What contract will actually receive as paymasterAndData
    const actualPaymasterAndData = concat([
      PAYMASTER_ADDRESS,
      pad(numberToHex(userOp.paymasterVerificationGasLimit), { size: 16 }),
      pad(numberToHex(userOp.paymasterPostOpGasLimit), { size: 16 }),
      userOp.paymasterData as `0x${string}`,
    ]);
    console.log('📦 actualPaymasterAndData:', actualPaymasterAndData);
    console.log(
      '📦 actual length bytes:',
      toBytes(actualPaymasterAndData).length,
    );

    // Simulate contract: strip last 65 bytes to get withoutSig
    const actualBytes = toBytes(actualPaymasterAndData);
    const withoutSig = actualBytes.slice(0, actualBytes.length - 65);
    const sigBytes = actualBytes.slice(-65);
    console.log(
      '📦 withoutSig:',
      bytesToHex(withoutSig),
      '| bytes:',
      withoutSig.length,
    );
    console.log(
      '📦 sigBytes  :',
      bytesToHex(sigBytes),
      '| bytes:',
      sigBytes.length,
    );

    // Reconstruct hash exactly as contract does
    const reconstructedHash = keccak256(
      encodeAbiParameters(parseAbiParameters('bytes32, address, uint256'), [
        keccak256(
          encodeAbiParameters(
            parseAbiParameters(
              'address, uint256, bytes32, bytes32, bytes32, uint256, bytes32, bytes32',
            ),
            [
              userOp.sender,
              userOp.nonce,
              keccak256('0x'),
              keccak256(userOp.callData),
              `0x${userOp.verificationGasLimit.toString(16).padStart(32, '0')}${userOp.callGasLimit.toString(16).padStart(32, '0')}` as `0x${string}`,
              userOp.preVerificationGas,
              `0x${userOp.maxPriorityFeePerGas.toString(16).padStart(32, '0')}${userOp.maxFeePerGas.toString(16).padStart(32, '0')}` as `0x${string}`,
              keccak256(bytesToHex(withoutSig) as `0x${string}`),
            ],
          ),
        ),
        ENTRY_POINT,
        BigInt(11155111),
      ]),
    );

    console.log('🔵 hashForPaymaster (what we signed)   :', hashForPaymaster);
    console.log(
      '🔵 reconstructedHash (what contract sees):',
      reconstructedHash,
    );
    console.log('🔵 hashes match:', hashForPaymaster === reconstructedHash);

    // Verify signature against reconstructedHash
    const ethHash = keccak256(
      encodePacked(
        ['string', 'bytes32'],
        ['\x19Ethereum Signed Message:\n32', reconstructedHash],
      ),
    );
    const recovered = await recoverAddress({
      hash: ethHash,
      signature: userOp.paymasterData as `0x${string}`,
    });
    console.log('🔑 recovered from reconstructedHash:', recovered);
    console.log('🔑 PAYMASTER_ADDRESS              :', PAYMASTER_ADDRESS);
    console.log(
      '🔑 signer match                   :',
      recovered.toLowerCase() === 'check paymaster logs',
    );

    const hashForWallet = getUserOpHash(userOp);
    userOp.signature = await signUserOp(hashForWallet);

    console.log(
      '🟢 FINAL userOp:',
      JSON.stringify(
        userOp,
        (_, v) => (typeof v === 'bigint' ? v.toString() : v),
        2,
      ),
    );

    return await sendUserOp(userOp);
  }
}
