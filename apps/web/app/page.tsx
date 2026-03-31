"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TxLifecycle } from "@/components/TxLifecycle";

const SMART_WALLET = process.env.NEXT_PUBLIC_SMART_WALLET as `0x${string}`;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type TxStatus = "idle" | "loading" | "success" | "error";

type TxRecord = {
  hash: string;
  to: string;
  amount: string;
  sponsored: boolean;
  status: "success" | "error";
  timestamp: number;
};

type SessionKey = {
  address: string;
  allowedTarget: string;
  maxAmount: string;
  validUntil: number;
  expiresAt: string;
  expired: boolean;
};

export default function Page() {
  const { isConnected } = useAccount();
  const { data: balance } = useBalance({ address: SMART_WALLET });

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sponsored, setSponsored] = useState(true);
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [isError, setIsError] = useState(false);

  const [sessions, setSessions] = useState<SessionKey[]>([]);
  const [sessionTarget, setSessionTarget] = useState("");
  const [sessionMaxAmount, setSessionMaxAmount] = useState("");
  const [sessionDuration, setSessionDuration] = useState("600");
  const [sessionStatus, setSessionStatus] = useState<TxStatus>("idle");
  const [activeSession, setActiveSession] = useState<SessionKey | null>(null);
  const [useSessionKey, setUseSessionKey] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch(`${API_URL}/session/list`);
      const data = await res.json();
      setSessions(data || []);
      const active = data?.find((s: SessionKey) => !s.expired);
      setActiveSession(active || null);
    } catch {
      setSessions([]);
    }
  }

  async function createSession() {
    if (!sessionTarget || !sessionMaxAmount) {
      toast.error("Fill in all session key fields");
      return;
    }

    setSessionStatus("loading");
    try {
      const res = await fetch(`${API_URL}/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedTarget: sessionTarget,
          maxAmount: BigInt(
            Math.floor(parseFloat(sessionMaxAmount) * 1e18),
          ).toString(),
          durationSeconds: parseInt(sessionDuration),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      setSessionStatus("success");
      toast.success("Session key created!");
      await fetchSessions();
      setSessionTarget("");
      setSessionMaxAmount("");
    } catch (err: any) {
      setSessionStatus("error");
      toast.error("Failed to create session key", { description: err.message });
    }
  }

  async function revokeSession(address: string) {
    try {
      await fetch(`${API_URL}/session/revoke/${address}`, { method: "DELETE" });
      toast.success("Session key revoked");
      await fetchSessions();
    } catch {
      toast.error("Failed to revoke session key");
    }
  }

  async function sendTransaction() {
    if (!to || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    setStatus("loading");
    setTxHash("");
    setIsError(false);

    try {
      const endpoint =
        useSessionKey && activeSession
          ? `${API_URL}/userop/send-session`
          : `${API_URL}/userop/send`;

      const body: any = {
        wallet: SMART_WALLET,
        to,
        amount: BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(),
      };

      if (useSessionKey && activeSession) {
        body.sessionKeyAddress = activeSession.address;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      setTxHash(data.result);
      setStatus("success");
      setIsError(false);

      setTxHistory((prev) => [
        {
          hash: data.result,
          to,
          amount,
          sponsored,
          status: "success",
          timestamp: Date.now(),
        },
        ...prev,
      ]);

      toast.success("Transaction sent!");
      setTo("");
      setAmount("");
    } catch (err: any) {
      setStatus("error");
      setIsError(true);
      toast.error("Transaction failed", { description: err.message });
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">WalletX</h1>
            <p className="text-muted-foreground text-sm">
              ERC-4337 Smart Wallet
            </p>
          </div>
          <ConnectButton />
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Smart Wallet <Badge variant="secondary">Sepolia</Badge>
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
                {balance
                  ? `${parseFloat(balance.formatted).toFixed(6)} ${balance.symbol}`
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Session Keys{" "}
              {activeSession && (
                <Badge variant="secondary" className="text-green-500">
                  Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Allowed Target Address</Label>
              <Input
                placeholder="0x..."
                value={sessionTarget}
                onChange={(e) => setSessionTarget(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Max Amount (ETH)</Label>
                <Input
                  type="number"
                  value={sessionMaxAmount}
                  onChange={(e) => setSessionMaxAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (sec)</Label>
                <Input
                  type="number"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={createSession}
              disabled={sessionStatus === "loading"}
            >
              {sessionStatus === "loading"
                ? "Creating..."
                : "🔑 Create Session Key"}
            </Button>
            {sessions.map((s) => (
              <div
                key={s.address}
                className="flex items-center justify-between border p-3 rounded-md"
              >
                <div className="text-xs">
                  <p className="font-mono">{s.address.slice(0, 10)}...</p>
                  <p className="text-muted-foreground">
                    Limit: {(Number(s.maxAmount) / 1e18).toFixed(4)} ETH
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeSession(s.address)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Input
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (ETH)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sponsored (Gasless)</p>
              </div>
              <Switch checked={sponsored} onCheckedChange={setSponsored} />
            </div>

            {activeSession && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Use Session Key</p>
                </div>
                <Switch
                  checked={useSessionKey}
                  onCheckedChange={setUseSessionKey}
                />
              </div>
            )}

            {status === "success" && txHash && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-sm font-medium text-green-500">
                  ✅ Transaction Sent
                </p>
                {/* FIXED LINK TAG HERE */}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-muted-foreground hover:underline break-all"
                >
                  {txHash}
                </a>
              </div>
            )}

            <Button
              className="w-full"
              onClick={sendTransaction}
              disabled={status === "loading" || !isConnected}
            >
              {status === "loading"
                ? "Sending..."
                : useSessionKey
                  ? "🔑 Send with Session Key"
                  : "⛽ Send Gasless"}
            </Button>
          </CardContent>
        </Card>

            <TxLifecycle
      txHash={txHash || null}
      isLoading={status === "loading"}
      isError={isError}
    />
      </div>
    </main>
  );
}
