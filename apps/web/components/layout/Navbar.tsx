import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "../ui/badge";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between py-6 px-8 border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground">
          X
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">WalletX</h1>
          <Badge
            variant="outline"
            className="text-[10px] uppercase tracking-widest"
          >
            AA Engine
          </Badge>
        </div>
      </div>
      <ConnectButton chainStatus="icon" showBalance={false} />
    </nav>
  );
}
