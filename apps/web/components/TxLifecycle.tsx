"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Stage = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

type StageStatus = "idle" | "active" | "done" | "error";

const STAGES: Stage[] = [
  {
    id: "sign",
    label: "UserOp Signed",
    description: "Owner or session key signs the UserOperation",
    icon: "✍️",
  },
  {
    id: "bundler",
    label: "Sent to Bundler",
    description: "UserOp submitted to Pimlico bundler",
    icon: "📦",
  },
  {
    id: "mempool",
    label: "In Mempool",
    description: "Bundler validates and holds in mempool",
    icon: "⏳",
  },
  {
    id: "entrypoint",
    label: "EntryPoint Processing",
    description: "EntryPoint verifies paymaster + wallet signatures",
    icon: "🔐",
  },
  {
    id: "executed",
    label: "Executed On-chain",
    description: "SmartWallet.execute() called successfully",
    icon: "✅",
  },
];

type Props = {
  txHash: string | null;
  isLoading: boolean;
  isError: boolean;
};

export function TxLifecycle({ txHash, isLoading, isError }: Props) {
  // Fixed the syntax for the Record type here
  const [stageStatuses, setStageStatuses] = useState<
    Record<string, StageStatus>
  >({
    sign: "idle",
    bundler: "idle",
    mempool: "idle",
    entrypoint: "idle",
    executed: "idle",
  });

  useEffect(() => {
    if (!isLoading && !txHash && !isError) {
      setStageStatuses({
        sign: "idle",
        bundler: "idle",
        mempool: "idle",
        entrypoint: "idle",
        executed: "idle",
      });
      return;
    }

    if (isError) {
      setStageStatuses((prev) => {
        const updated = { ...prev };
        for (const stage of STAGES) {
          if (updated[stage.id] === "active") {
            updated[stage.id] = "error";
            break;
          }
        }
        return updated;
      });
      return;
    }

    if (isLoading) {
      let current = 0;
      setStageStatuses({
        sign: "idle",
        bundler: "idle",
        mempool: "idle",
        entrypoint: "idle",
        executed: "idle",
      });

      const interval = setInterval(() => {
        if (current >= STAGES.length - 1) {
          clearInterval(interval);
          return;
        }
        const stageId = STAGES[current].id;
        setStageStatuses((prev) => ({
          ...prev,
          [stageId]: "done",
          [STAGES[current + 1]?.id]: "active",
        }));
        current++;
      }, 800);

      setStageStatuses((prev) => ({ ...prev, sign: "active" }));
      return () => clearInterval(interval);
    }

    if (txHash) {
      setStageStatuses({
        sign: "done",
        bundler: "done",
        mempool: "done",
        entrypoint: "done",
        executed: "done",
      });
    }
  }, [isLoading, txHash, isError]);

  const isVisible = isLoading || txHash !== null || isError;
  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Transaction Lifecycle
          {isLoading && (
            <Badge variant="secondary" className="text-yellow-500">
              Processing...
            </Badge>
          )}
          {txHash && !isLoading && (
            <Badge variant="secondary" className="text-green-500">
              Confirmed
            </Badge>
          )}
          {isError && <Badge variant="destructive">Failed</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {STAGES.map((stage) => {
              const status = stageStatuses[stage.id];
              return (
                <div key={stage.id} className="flex items-start gap-4 pl-2">
                  <div
                    className={`
                      relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs
                      ${status === "done" ? "bg-green-500 border-green-500 text-white" : ""}
                      ${status === "active" ? "bg-yellow-500 border-yellow-500 text-white animate-pulse" : ""}
                      ${status === "error" ? "bg-red-500 border-red-500 text-white" : ""}
                      ${status === "idle" ? "bg-background border-border text-muted-foreground" : ""}
                    `}
                  >
                    {status === "done"
                      ? "✓"
                      : status === "error"
                        ? "✗"
                        : stage.icon[0]}
                  </div>

                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          status === "idle" ? "text-muted-foreground" : ""
                        } ${status === "done" ? "text-green-500" : ""} ${
                          status === "active" ? "text-yellow-500" : ""
                        } ${status === "error" ? "text-red-500" : ""}`}
                      >
                        {stage.icon} {stage.label}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stage.description}
                    </p>

                    {/* FIXED: Added missing <a> tag */}
                    {status === "done" && stage.id === "executed" && txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline font-mono mt-1 block"
                      >
                        {txHash.slice(0, 20)}...{txHash.slice(-8)} ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
