'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Ensure these are defined in your .env.local
const SMART_WALLET = (process.env.NEXT_PUBLIC_SMART_WALLET || '0x0') as `0x${string}`;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type TxStatus = 'idle' | 'loading' | 'success' | 'error';

type TxRecord = {
  hash: string;
  to: string;
  amount: string;
  sponsored: boolean;
  status: 'success' | 'error';
  timestamp: number;
};

export default function Page() {
  const { isConnected } = useAccount();
  const { data: balance } = useBalance({ address: SMART_WALLET });

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [sponsored, setSponsored] = useState(true);
  const [status, setStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState('');
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);

  async function sendTransaction() {
    if (!to || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setStatus('loading');
    setTxHash('');

    try {
      const res = await fetch(`${API_URL}/userop/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: SMART_WALLET,
          to,
          // Convert to Wei as a string
          amount: (BigInt(Math.floor(parseFloat(amount) * 1e9)) * BigInt(1e9)).toString(),
          sponsored, // Pass sponsorship preference to backend
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || 'Transaction failed');
      }

      setTxHash(data.result);
      setStatus('success');
      
      setTxHistory((prev) => [
        {
          hash: data.result,
          to,
          amount,
          sponsored,
          status: 'success',
          timestamp: Date.now(),
        },
        ...prev,
      ]);

      toast.success('Transaction sent!', {
        description: `Hash: ${data.result.slice(0, 20)}...`,
        action: {
          label: 'View',
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${data.result}`, '_blank'),
        },
      });
      
      setTo('');
      setAmount('');
    } catch (err: any) {
      setStatus('error');
      toast.error('Transaction failed', {
        description: err.message,
      });
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">WalletX</h1>
            <p className="text-muted-foreground text-sm">ERC-4337 Smart Wallet</p>
          </div>
          <ConnectButton />
        </div>

        <Separator />

        {/* Smart Wallet Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Smart Wallet
              <Badge variant="secondary">Sepolia</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-mono text-sm break-all">{SMART_WALLET}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-semibold">
                {balance ? `${parseFloat(balance.formatted).toFixed(6)} ${balance.symbol}` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Send Transaction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Input
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (ETH)</Label>
              <Input
                placeholder="0.001"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sponsored (Gasless)</p>
                <p className="text-xs text-muted-foreground">Paymaster covers gas fees</p>
              </div>
              <Switch checked={sponsored} onCheckedChange={setSponsored} />
            </div>

            {/* Status Display */}
            {status === 'success' && txHash && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 space-y-1">
                <p className="text-sm font-medium text-green-500">✅ Transaction Sent</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground hover:underline break-all block"
                >
                  {txHash}
                </a>
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm font-medium text-red-500">❌ Transaction Failed</p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={sendTransaction}
              disabled={status === 'loading' || !isConnected}
            >
              {status === 'loading'
                ? 'Sending...'
                : !isConnected
                ? 'Connect Wallet First'
                : sponsored
                ? '⛽ Send Gasless'
                : 'Send Transaction'}
            </Button>

            {!isConnected && (
              <p className="text-xs text-center text-muted-foreground">
                Connect your wallet to send transactions
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        {txHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {txHistory.map((tx) => (
                <div key={tx.hash} className="flex items-center justify-between text-sm">
                  <div className="space-y-0.5">
                    <p className="font-mono text-xs text-muted-foreground">
                      To: {tx.to.slice(0, 10)}...{tx.to.slice(-6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.amount} ETH • {new Date(tx.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {tx.sponsored && (
                      <Badge variant="secondary" className="text-xs">Gasless</Badge>
                    )}
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                        View ↗
                      </Badge>
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}