"use client";

import { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { toast } from "sonner";
import { AccountDetails } from "@/components/wallet/AccountDetails";
import { SessionManager } from "@/components/wallet/SessionManager";
import { TransactionForm } from "@/components/wallet/TransactionForm";
import { TxLifecycle } from "@/components/TxLifecycle";

const SMART_WALLET = process.env.NEXT_PUBLIC_SMART_WALLET as `0x${string}`;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  const { isConnected } = useAccount();
  const { data: balance } = useBalance({ address: SMART_WALLET });

  const [status, setStatus] = useState("idle");
  const [txHash, setTxHash] = useState("");
  const [isError, setIsError] = useState(false);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sponsored, setSponsored] = useState(true);
  const [useSessionKey, setUseSessionKey] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    target: "",
    amount: "",
    duration: "3600",
  });
  const isProcessing = status === "loading" || status === "pending";

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/session/list`);
      const data = await res.json();
      setSessions(data || []);
      setActiveSession(data?.find((s: any) => !s.expired) || null);
    } catch {
      setSessions([]);
    }
  };

  const createSession = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowedTarget: sessionForm.target,
          maxAmount: BigInt(
            Math.floor(parseFloat(sessionForm.amount) * 1e18),
          ).toString(),
          durationSeconds: parseInt(sessionForm.duration),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Session Key Created");
      fetchSessions();
    } catch (e) {
      toast.error("Creation failed");
    } finally {
      setStatus("idle");
    }
  };

  const trackUserOp = async (userOpHash: string) => {
    toast.loading("⏳ Sending UserOperation...", { id: userOpHash });

    let done = false;

    while (!done) {
      try {
        const res = await fetch(`${API_URL}/userop/status/${userOpHash}`);
        const data = await res.json();

        if (data.status === "pending") {
          toast.loading("📡 Waiting for bundler...", {
            id: userOpHash,
          });
        }

        if (data.status === "confirmed") {
          toast.success("✅ UserOperation Confirmed!", {
            id: userOpHash,
            action: {
              label: "View on Etherscan",
              onClick: () => {
                window.open(
                  `https://sepolia.etherscan.io/tx/${data.txHash}`,
                  "_blank",
                );
              },
            },
          });

          setTxHash(data.txHash);
          setStatus("success");
          done = true;
        }

        if (data.status === "failed") {
          toast.error("❌ Transaction failed", {
            id: userOpHash,
          });

          setStatus("error");
          setIsError(true);
          done = true;
        }

        await new Promise((r) => setTimeout(r, 2000));
      } catch (error) {
        toast.error("⚠️ Tracking error", { id: userOpHash });
        done = true;
      }
    }
  };

  const handleSend = async () => {
    setStatus("loading");
    setTxHash("");
    setIsError(false);
    try {
      const endpoint =
        useSessionKey && activeSession
          ? `${API_URL}/userop/send-session`
          : `${API_URL}/userop/send`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: SMART_WALLET,
          to,
          amount: BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(),
          sessionKeyAddress: useSessionKey ? activeSession?.address : undefined,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const userOpHash = data.result;

      setTxHash(userOpHash);
      setStatus("pending");

      trackUserOp(userOpHash);
    } catch (err) {
      setStatus("error");
      setIsError(true);
      toast.error("❌ Failed to send transaction");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* <Navbar /> */}
      <main className="container max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Side Panel: Identity & Access */}
          <div className="lg:col-span-5 space-y-6">
            <AccountDetails address={SMART_WALLET} balance={balance} />
            <SessionManager
              sessions={sessions}
              activeSession={activeSession}
              formState={sessionForm}
              setFormState={setSessionForm}
              onCreate={createSession}
              status={status}
              isProcessing={isProcessing}
              onRevoke={async (addr: string) => {
                await fetch(`${API_URL}/session/revoke/${addr}`, {
                  method: "DELETE",
                });
                fetchSessions();
              }}
            />
          </div>

          {/* Main Panel: Action & Feedback */}
          <div className="lg:col-span-7 space-y-6">
            <TransactionForm
              to={to}
              setTo={setTo}
              amount={amount}
              setAmount={setAmount}
              sponsored={sponsored}
              setSponsored={setSponsored}
              useSessionKey={useSessionKey}
              setUseSessionKey={setUseSessionKey}
              activeSession={activeSession}
              onSend={handleSend}
              status={status}
              isConnected={isConnected}
              isProcessing={isProcessing}
            />

            <TxLifecycle
              txHash={txHash}
              isLoading={status === "loading"}
              isError={isError}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
