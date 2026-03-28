/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { toHex } from 'viem/utils';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
function serializeUserOp(userOp: any) {
  return {
    ...userOp,
    nonce: toHex(userOp.nonce),
    callGasLimit: toHex(userOp.callGasLimit),
    verificationGasLimit: toHex(userOp.verificationGasLimit),
    preVerificationGas: toHex(userOp.preVerificationGas),
    maxFeePerGas: toHex(userOp.maxFeePerGas),
    maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
  };
}

export async function sendUserOp(userOp: any) {
  const serialized = serializeUserOp(userOp);

  const res = await fetch(process.env.BUNDLER_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: [serialized, process.env.ENTRY_POINT],
    }),
  });

  return res.json();
}
