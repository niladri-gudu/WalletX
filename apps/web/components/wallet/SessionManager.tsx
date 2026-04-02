/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Trash2 } from "lucide-react";

export function SessionManager({ 
  sessions, 
  activeSession, 
  onCreate, 
  onRevoke,
  formState,
  setFormState,
  status 
}: any) {
  return (
    <Card className="shadow-sm border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between font-bold">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Session Keys
          </div>
          {activeSession && <Badge className="bg-emerald-500/10 text-emerald-500 border-none">Active</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Allowed Target (Dapp Address)</Label>
            <Input 
              placeholder="0x..." 
              value={formState.target} 
              onChange={(e) => setFormState({...formState, target: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Max Spend (ETH)</Label>
              <Input 
                type="number" 
                value={formState.amount} 
                onChange={(e) => setFormState({...formState, amount: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Seconds</Label>
              <Input 
                type="number" 
                value={formState.duration} 
                onChange={(e) => setFormState({...formState, duration: e.target.value})}
              />
            </div>
          </div>
          <Button 
            className="w-full font-semibold" 
            onClick={onCreate}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Generating..." : "Create Session Key"}
          </Button>
        </div>

        {sessions.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Managed Keys</p>
            {sessions.map((s: any) => (
              <div key={s.address} className="flex items-center justify-between rounded-md border p-2 bg-muted/30">
                <div className="text-xs">
                  <p className="font-mono font-medium">{s.address.slice(0, 6)}...{s.address.slice(-4)}</p>
                  <p className="text-muted-foreground">Limit: {(Number(s.maxAmount) / 1e18).toFixed(3)} ETH</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onRevoke(s.address)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}