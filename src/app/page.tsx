import QuoteGenerator from "@/components/QuoteGenerator"; 

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-cs-gradient-light to-cs-gradient-dark">
      <QuoteGenerator />
    </main>
  );
}
