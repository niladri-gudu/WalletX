/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

export function AccountDetails({
  address,
  balance,
}: {
  address: string;
  balance: any;
}) {
  return (
    <Card className="bg-linear-to-br from-card to-muted/50 overflow-hidden border-primary/10">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Smart Account
            </p>
            <p className="font-mono text-sm truncate">{address}</p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Balance
              </p>
              <h2 className="text-3xl font-bold">
                {balance
                  ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                  : "0.00"}
              </h2>
            </div>
            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">
              Sepolia
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
