import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLewisQuoteById } from "@/lib/quote-store";
import QuoteGenerator from "@/components/QuoteGenerator";
import { PageShell } from "@/components/PageShell";

// Rota dinâmica de propósito: o id vem da fonte ÚNICA do cluster (ADR 001)
// — a API do Scriptorium. Sem generateStaticParams: reordenamentos/novas
// citações no acervo compactam numa URL estável (uuid da tabela quotes),
// ao contrário dos índices antigos (que quebravam a cada reordenação).
export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quote = await findLewisQuoteById(params.id).catch(() => null);
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

export default async function QuotePage({ params }: Props) {
  // Diferente de `generateMetadata`, aqui NÃO engole a falha: com o Scriptorium fora, o armazém ainda
  // acha qualquer citação que o Gerador já conhece (lista em memória ou cópia embutida) e a página sai
  // normalmente. Só vira 404 quando a lista é recente e o id não está nela; se a lista NÃO é recente e o id
  // não aparece, o erro sobe e a página responde 500 (o crawler tenta de novo): o id pode ser uma citação
  // nova que só o Scriptorium conhece.
  const quote = await findLewisQuoteById(params.id);
  if (!quote) {
    notFound();
    return;
  }

  return (
    <PageShell>
      <QuoteGenerator initialQuote={quote} />
    </PageShell>
  );
}