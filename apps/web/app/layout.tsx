import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Shell } from "@/components/layout/Shell";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WalletX — AA Smart Wallet",
  description: "ERC-4337 Smart Wallet with gasless transactions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={geist.className}>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
