/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { toHex } from 'viem/utils';

function serializeUserOp(userOp: any) {
  const op: any = {
    sender: userOp.sender,
    nonce: toHex(userOp.nonce),
    callData: userOp.callData,
    callGasLimit: toHex(userOp.callGasLimit),
    verificationGasLimit: toHex(userOp.verificationGasLimit),
    preVerificationGas: toHex(userOp.preVerificationGas),
    maxFeePerGas: toHex(userOp.maxFeePerGas),
    maxPriorityFeePerGas: toHex(userOp.maxPriorityFeePerGas),
    signature: userOp.signature,
  };

  if (userOp.factory) {
    op.factory = userOp.factory;
    op.factoryData = userOp.factoryData ?? '0x';
  }

  if (userOp.paymaster) {
    op.paymaster = userOp.paymaster;
    op.paymasterVerificationGasLimit = toHex(
      userOp.paymasterVerificationGasLimit,
    );
    op.paymasterPostOpGasLimit = toHex(userOp.paymasterPostOpGasLimit);
    op.paymasterData = userOp.paymasterData ?? '0x';
  }

  console.log('📤 serialized userOp:', JSON.stringify(op, null, 2));
  return op;
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
  const result = await res.json();
  console.log('📥 bundler response:', JSON.stringify(result, null, 2));
  return result;
}
