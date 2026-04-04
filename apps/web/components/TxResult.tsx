"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

export function TxResult({ txHash }: { txHash: string }) {
  if (!txHash) return null;

  return (
    <div className="mt-6 w-full">
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-green-500 font-semibold">
            ✅ Transaction Confirmed
          </div>

          <div className="text-sm text-muted-foreground">
            Your transaction has been successfully executed on-chain.
          </div>

          <div className="bg-muted p-3 rounded-lg font-mono text-xs break-all">
            {txHash}
          </div>

          <Button
            variant="outline"
            className="w-fit"
            onClick={() =>
              window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank")
            }
          >
            View on Explorer <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
