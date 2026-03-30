import { encodeFunctionData } from 'viem';
import { UserOperation } from './userop.types.js';

// import { UserOperation } from './userop.types';

// export function buildCallData(
//   to: `0x${string}`,
//   value: bigint,
//   data: `0x${string}`,
// ) {
//   return encodeFunctionData({
//     abi: [
//       {
//         name: 'execute',
//         type: 'function',
//         stateMutability: 'nonpayable',
//         inputs: [
//           { name: 'to', type: 'address' },
//           { name: 'value', type: 'uint256' },
//           { name: 'data', type: 'bytes' },
//         ],
//         outputs: [],
//       },
//     ],
//     functionName: 'execute',
//     args: [to, value, data],
//   });
// }

// export function buildUserOp(
//   sender: `0x${string}`,
//   nonce: bigint,
//   callData: `0x${string}`,
// ): UserOperation {
//   return {
//     sender,
//     nonce,
//     initCode: '0x',
//     callData,

//     callGasLimit: 150000n,
//     verificationGasLimit: 200000n,
//     preVerificationGas: 60000n,

//     maxFeePerGas: 20000000000n,
//     maxPriorityFeePerGas: 1000000000n,

//     paymasterAndData: '0x',

//     signature: '0x',
//   };
// }

export function buildCallData(
  to: `0x${string}`,
  value: bigint,
  data: `0x${string}`,
) {
  return encodeFunctionData({
    abi: [
      {
        name: 'execute',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
        outputs: [],
      },
    ],
    functionName: 'execute',
    args: [to, value, data],
  });
}

export function buildUserOp(
  sender: `0x${string}`,
  nonce: bigint,
  callData: `0x${string}`,
): UserOperation {
  return {
    sender,
    nonce,

    factory: null,
    factoryData: null,

    callData,

    callGasLimit: 150000n,
    verificationGasLimit: 200000n,
    preVerificationGas: 60000n,

    maxFeePerGas: 20000000000n,
    maxPriorityFeePerGas: 1000000000n,

    paymaster: null,
    paymasterVerificationGasLimit: 100000n,
    paymasterPostOpGasLimit: 50000n,
    paymasterData: null,

    signature: '0x',
  };
}
