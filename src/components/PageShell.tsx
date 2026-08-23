import { ModeToggle } from "@/components/ModeToggle";
import { ClusterFooter } from "@/components/ClusterFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-narniano relative flex min-h-screen flex-col items-center justify-center p-4 pt-16 sm:p-6 sm:pt-20">
      <header className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ModeToggle />
      </header>
      {children}
      <ClusterFooter />
    </main>
  );
}

