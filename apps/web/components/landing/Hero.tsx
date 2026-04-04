"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, ShieldCheck, Zap, Layers } from "lucide-react";
import Link from "next/link";

export default function TechLanding() {
  return (
    <div className="flex flex-col gap-16 py-12 animate-in fade-in duration-700">
      {/* Technical Header */}
      <section className="flex flex-col items-start gap-6">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="rounded-md px-2 py-0.5 font-mono text-[10px] uppercase border-border bg-background"
          >
            Status: Development
          </Badge>
          <div className="h-px w-12 bg-border" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Protocol: ERC-4337 / EntryPoint v0.6
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.85] text-foreground">
          SMART <br />
          <span className="text-muted-foreground">ABSTRACTION.</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-xl font-medium leading-relaxed">
          A modular Account Abstraction stack implementing programmable validation
          logic. Built to demonstrate gasless execution, session-based 
          authorization, and paymaster-sponsored transactions.
        </p>

        <div className="flex items-center gap-4 pt-4">
          <Button size="lg" className="rounded-xl font-bold h-12 px-6 shadow-sm" asChild>
            <Link href="/dashboard">
              Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-xl border-border hover:bg-muted/50 transition-colors"
            asChild
          >
            <Link href="https://github.com" target="_blank" rel="noreferrer">
              <Code2 className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Tech Stack Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TechCard
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Smart Account"
          value="Kernel v2"
          label="A modular smart contract wallet framework for secure execution."
        />
        <TechCard
          icon={<Layers className="h-4 w-4" />}
          title="Bundler"
          value="Pimlico"
          label="The infrastructure layer for UserOperation propagation and mining."
        />
        <TechCard
          icon={<Zap className="h-4 w-4" />}
          title="Paymaster"
          value="ERC-20 / Sponsored"
          label="Enables gasless UX via VerifyingPaymaster backend signing."
        />
        <TechCard
          icon={<Code2 className="h-4 w-4" />}
          title="Chain"
          value="Base Sepolia"
          label="Ethereum L2 testnet for low-cost, high-speed AA validation."
        />
      </section>

      {/* Architecture Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Core Implementation
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            src/lib/userop/structure.json
          </span>
        </div>
        
        <section className="rounded-2xl border border-border bg-card/50 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-border" />
              <div className="h-2.5 w-2.5 rounded-full bg-border" />
              <div className="h-2.5 w-2.5 rounded-full bg-border" />
            </div>
            <span className="ml-2 text-[10px] font-mono text-muted-foreground">
              UserOperation.ts
            </span>
          </div>
          <div className="p-6 font-mono text-[12px] text-muted-foreground overflow-x-auto bg-[#0d0d0d] leading-relaxed">
            <pre className="text-emerald-500/90">{`{
  "sender": "0x...", // Smart Wallet (Kernel)
  "nonce": "0x01",
  "initCode": "0x",
  "callData": "0x...", // Execute Intent
  "callGasLimit": "0x186a0",
  "verificationGasLimit": "0x186a0",
  "preVerificationGas": "0x186a0",
  "maxFeePerGas": "0x...",
  "maxPriorityFeePerGas": "0x...",
  "paymasterAndData": "0x...", // Sponsored Signature
  "signature": "0x..." // Session Key or Owner Sig
}`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}

function TechCard({
  icon,
  title,
  value,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  label: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-background shadow-sm hover:border-primary/20 hover:bg-muted/5 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </p>
        <div className="text-muted-foreground/40 group-hover:text-primary transition-colors">
          {icon}
        </div>
      </div>
      <p className="text-lg font-bold text-foreground mb-2">{value}</p>
      <p className="text-[11px] text-muted-foreground leading-normal">
        {label}
      </p>
    </div>
  );
}