import { NextResponse } from "next/server";
import { pickRandomLewisQuote } from "@/lib/quote-store";

// Sorteio para o botão "Gerar nova citação". O navegador chama ESTA rota (mesma origem), nunca o
// Scriptorium: ela sorteia na lista que o servidor já tem (ao vivo, em memória ou a cópia embutida),
// então responde mesmo com o Scriptorium fora do ar. Nunca é guardada em cache: cada clique, uma citação.
export const dynamic = "force-dynamic";

export async function GET() {
  const { quote, origem } = await pickRandomLewisQuote();
  if (!quote) {
    return NextResponse.json({ error: "sem_citacoes" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(quote, {
    headers: {
      "Cache-Control": "no-store",
      // De onde veio a lista (ao-vivo | memoria | reserva): deixa ver de fora se o Gerador está na reserva.
      "X-Citacao-Origem": origem,
    },
  });
}
