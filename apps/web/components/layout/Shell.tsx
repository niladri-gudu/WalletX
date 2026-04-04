import Footer from "./Footer";
import { Navbar } from "./Navbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background font-sans antialiased overflow-x-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 pt-24 pb-6 px-4">
          <div className="max-w-7xl mx-auto w-full">
             {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}