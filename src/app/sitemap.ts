import type { MetadataRoute } from "next";
import { lewisQuotes } from "@/lib/quotes";

const baseUrl = "https://cslewis.narniano.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const quoteUrls: MetadataRoute.Sitemap = lewisQuotes.map((_, index) => ({
    url: `${baseUrl}/citacao/${index}`,
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
