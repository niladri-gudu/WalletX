import Footer from "./Footer";
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/sonner";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background font-sans antialiased overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1">{children}</div>

        <Footer />
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
