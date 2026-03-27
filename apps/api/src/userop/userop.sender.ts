export async function sendUserOp(userOp: any) {
  const res = await fetch(process.env.BUNDLER_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: [userOp, process.env.ENTRY_POINT],
    }),
  });

  return res.json();
}
