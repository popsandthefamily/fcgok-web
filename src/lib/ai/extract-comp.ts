import { generateText } from './provider';

export interface ExtractedComp {
  property_name: string | null;
  city: string | null;
  state: string | null;
  sale_price: number | null;
  sale_date: string | null;
  buyer: string | null;
  seller: string | null;
  asset_type: string | null;
  units: number | null;
  square_feet: number | null;
  cap_rate: number | null;
  noi: number | null;
  notes: string | null;
}

const SYSTEM = `You extract structured comparable-transaction records from commercial real estate news articles and filings.

Given an article, identify whether it describes one or more actual, closed real estate transactions. If yes, return a JSON array of transaction objects. If the article is general market commentary with no specific transaction, return an empty array.

Each object:
{
  "property_name": string or null,
  "city": string or null,
  "state": string (2-letter code) or null,
  "sale_price": number (dollars, not millions) or null,
  "sale_date": "YYYY-MM-DD" or null,
  "buyer": string or null,
  "seller": string or null,
  "asset_type": "self-storage" | "multi-family" | "industrial" | "retail" | "office" | "hospitality" | "mixed" | null,
  "units": number or null,
  "square_feet": number or null,
  "cap_rate": number (e.g. 5.8 for 5.8%) or null,
  "noi": number (dollars) or null,
  "notes": brief one-line note or null
}

Rules:
- Only include actual transactions with at least a sale price OR buyer/seller identified.
- Convert "M" or "million" to full numbers: $42M → 42000000.
- If the article mentions a portfolio of deals, list each individually when detail is given; otherwise return one aggregated record.
- Return ONLY the JSON array, no markdown fences, no explanation.`;

export async function extractCompsFromIntel(
  title: string,
  body: string | null,
  summary: string | null,
): Promise<ExtractedComp[]> {
  const content = [
    `Title: ${title}`,
    summary ? `Summary: ${summary}` : null,
    body ? `Body:\n${body.slice(0, 5000)}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const raw = await generateText(SYSTEM, content, 1500, 'quality');
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c: Record<string, unknown>) => c.sale_price || c.buyer || c.seller,
    ) as ExtractedComp[];
  } catch {
    return [];
  }
}
