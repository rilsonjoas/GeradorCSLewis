import type { MetadataRoute } from "next";
import { getLewisQuotes } from "@/lib/quote-store";

const baseUrl = "https://cslewis.narniano.com";

// Ids estáveis (uuid da tabela quotes no Scriptorium — ADR 001). Com o Scriptorium fora do ar, o
// armazém devolve a última lista boa ou a cópia embutida: o sitemap continua completo.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { quotes } = await getLewisQuotes();

  const quoteUrls: MetadataRoute.Sitemap = quotes.map((quote) => ({
    url: `${baseUrl}/citacao/${quote.id}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...quoteUrls,
  ];
}