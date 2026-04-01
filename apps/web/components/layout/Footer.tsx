import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-8 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cpu className="h-4 w-4" />
            <span>
              Powered by{" "}
              <span className="text-foreground font-semibold">ERC-4337</span> &{" "}
              <span className="text-primary font-semibold">Pimlico</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                System Status
              </span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono">Bundler Online</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <p className="text-xs font-mono text-muted-foreground italic">
              Built for the Future of Wallets
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
