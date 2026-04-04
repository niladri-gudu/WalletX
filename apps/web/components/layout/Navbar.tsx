import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";

export function Navbar() {
  return (
    <nav className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex items-center justify-between w-full max-w-7xl h-16 px-6 rounded-2xl border border-border bg-background/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-foreground rounded-lg flex items-center justify-center font-bold text-background text-lg">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight leading-none text-foreground">WalletX</h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1.5 font-medium">
              AA Engine
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </nav>
  );
}