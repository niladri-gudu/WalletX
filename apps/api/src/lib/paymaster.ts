/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { keccak256, encodePacked } from 'viem';
import { paymasterSigner } from './paymasterSigner.js';
import { PAYMASTER_ADDRESS, CHAIN_ID } from '../config/constants.js';

export async function getPaymasterDataFromHash(userOp: any) {
  const rawHash = keccak256(
    encodePacked(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'uint256',
      ] as const,
      [
        userOp.sender as `0x${string}`,
        userOp.nonce as bigint,
        keccak256(userOp.initCode as `0x${string}`),
        keccak256(userOp.callData as `0x${string}`),
        userOp.callGasLimit as bigint,
        userOp.verificationGasLimit as bigint,
        userOp.preVerificationGas as bigint,
        PAYMASTER_ADDRESS,
        BigInt(CHAIN_ID),
      ],
    ),
  );

  const signature = await paymasterSigner.signMessage({
    message: { raw: rawHash },
  });

  return (PAYMASTER_ADDRESS + signature.slice(2)) as `0x${string}`;
}
