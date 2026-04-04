import { Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full pb-6 flex justify-center px-4">
      <div className="w-full max-w-7xl rounded-2xl border border-border bg-background/50 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">
              Powered by <span className="text-foreground font-semibold">ERC-4337</span> & <span className="text-foreground font-semibold">Pimlico</span>
            </span>
          </div>

          <div className="flex items-center gap-4 bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-foreground">BUNDLER_ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}