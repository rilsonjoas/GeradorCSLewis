import type { MetadataRoute } from "next";
import { fetchLewisQuotes } from "@/lib/quote-api";

const baseUrl = "https://cslewis.narniano.com";

// Ids estáveis (uuid da tabela quotes no Scriptorium — ADR 001). Se a API
// estiver fora no momento da geração, devolve só a home (some com graça).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const quotes = await fetchLewisQuotes().catch(() => []);

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