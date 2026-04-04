import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SendHorizontal, Zap, KeyRound } from "lucide-react";

interface TxFormProps {
  to: string;
  setTo: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  sponsored: boolean;
  setSponsored: (val: boolean) => void;
  useSessionKey: boolean;
  setUseSessionKey: (val: boolean) => void;
  activeSession: any;
  onSend: () => void;
  status: string;
  isConnected: boolean;
  isProcessing: boolean;
}

export function TransactionForm({
  to,
  setTo,
  amount,
  setAmount,
  sponsored,
  setSponsored,
  useSessionKey,
  setUseSessionKey,
  activeSession,
  onSend,
  isConnected,
  isProcessing,
}: TxFormProps) {
  return (
    <Card className="border-primary/10 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <SendHorizontal className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Transfer Assets</CardTitle>
        </div>
        <CardDescription>
          Execute a gasless transaction via ERC-4337 Paymasters.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="recipient"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="0x..."
              className="font-mono bg-background/50 border-muted focus-visible:ring-primary h-11"
              value={to}
              disabled={isProcessing}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-4 pr-16 font-semibold bg-background/50 border-muted h-11 text-lg"
                value={amount}
                disabled={isProcessing}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-muted text-[10px] font-bold">
                ETH
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10 transition-colors hover:bg-muted/20">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">Sponsored</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Gasless Execution
              </span>
            </div>
            <Switch 
              checked={sponsored} 
              onCheckedChange={setSponsored} 
              disabled={isProcessing}
            />
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              activeSession
                ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                : "opacity-50 grayscale pointer-events-none"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-bold">Session Key</span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                {activeSession ? "Authorized Key" : "No Active Session"}
              </span>
            </div>
            <Switch
              checked={useSessionKey}
              onCheckedChange={setUseSessionKey}
              disabled={!activeSession || isProcessing}
            />
          </div>
        </div>

        <Button
          className={`w-full h-12 text-md font-bold transition-all active:scale-[0.98] ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          size="lg"
          onClick={onSend}
          disabled={isProcessing || !isConnected || !to || !amount}
        >
          {isProcessing ? "Processing..." : "Send Transaction"}
        </Button>
      </CardContent>
    </Card>
  );
}