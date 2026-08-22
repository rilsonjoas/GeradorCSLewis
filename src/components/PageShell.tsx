import { ModeToggle } from "@/components/ModeToggle";
import { ClusterFooter } from "@/components/ClusterFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-narniano relative flex min-h-screen flex-col items-center justify-center p-6">
      <header className="absolute right-4 top-4">
        <ModeToggle />
      </header>
      {children}
      <ClusterFooter />
    </main>
  );
}
