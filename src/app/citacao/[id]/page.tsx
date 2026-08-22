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
    return { title: "Citação não encontrada" };
  }

  // <title> descritivo e estável (obra + marca) — a citação em si não
  // vira título da aba; ela aparece na description, que é o lugar dela.
  const title = quote.source ?? "Citação de C. S. Lewis";

  const description = quote.source
    ? `“${quote.quote}” — C. S. Lewis, em ${quote.source}.`
    : `“${quote.quote}” — C. S. Lewis.`;

  const og = {
    // No card de compartilhamento a citação sim brilha — é o conteúdo.
    title: "Citação de C. S. Lewis",
    description,
    type: "website" as const,
    locale: "pt_BR",
    images: ["/Lewis.png"],
  };

  return {
    title,
    description,
    openGraph: og,
    twitter: { card: "summary", title: og.title, description },
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
