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
  userOpHash: string;
  txHash: string;
  status: string;
};

export function TxLifecycle({ userOpHash, txHash, status }: Props) {
  const getStatus = (step: number) => {
    if (status === "error") return "error";

    if (step === 0 && userOpHash) return "done";
    if (step === 1 && status === "pending") return "active";
    if (step === 1 && status === "success") return "done";
    if (step === 2 && txHash) return "done";

    return "idle";
  };

  const steps = ["UserOp Sent", "Waiting for Bundler", "Executed On-chain"];

  return (
    <div className="p-4 border rounded-xl space-y-3">
      <h3 className="font-semibold">Transaction Lifecycle</h3>

      {steps.map((label, i) => {
        const s = getStatus(i);

        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                s === "done"
                  ? "bg-green-500"
                  : s === "active"
                    ? "bg-yellow-500 animate-pulse"
                    : s === "error"
                      ? "bg-red-500"
                      : "bg-gray-300"
              }`}
            />
            <span>{label}</span>
          </div>
        );
      })}

      {userOpHash && (
        <p className="text-xs text-gray-500 break-all">UserOp: {userOpHash}</p>
      )}

      {txHash && (
        <p className="text-xs text-green-600 break-all">Tx: {txHash}</p>
      )}
    </div>
  );
}
