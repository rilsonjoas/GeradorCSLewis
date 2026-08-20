import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lewisQuotes } from "@/lib/quotes";
import QuoteGenerator from "@/components/QuoteGenerator";
import { PageShell } from "@/components/PageShell";

interface Props {
  params: { id: string };
}

function getQuote(id: string) {
  const index = Number(id);
  if (!Number.isInteger(index) || index < 0 || index >= lewisQuotes.length) {
    return null;
  }
  return lewisQuotes[index];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quote = getQuote(params.id);
  if (!quote) {
    return { title: "Citação não encontrada | Gerador C. S. Lewis" };
  }

  const title = `"${quote.quote}" — C. S. Lewis`;
  const description = quote.source
    ? `Uma citação de C. S. Lewis em ${quote.source}.`
    : "Uma citação de C. S. Lewis.";

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR" },
    twitter: { card: "summary", title, description },
  };
}

// Cada citação é um índice fixo no array de src/lib/quotes.ts — estável
// enquanto a ordem do array não mudar. Suficiente pro tamanho do projeto;
// se um dia o array crescer/for reordenado com frequência, migrar pra
// slug próprio por citação.
export function generateStaticParams() {
  return lewisQuotes.map((_, index) => ({ id: String(index) }));
}

export default function QuotePage({ params }: Props) {
  const quote = getQuote(params.id);
  if (!quote) {
    notFound();
  }

  return (
    <PageShell>
      <QuoteGenerator initialQuoteId={Number(params.id)} />
    </PageShell>
  );
}
