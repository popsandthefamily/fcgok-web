import { generateText } from './provider';

export interface SnapshotScores {
  population_momentum: number;
  supply_demand_gap: number;
  barrier_to_entry: number;
  economic_diversity: number;
  competitive_saturation: number;
  infrastructure_access: number;
}

export interface SnapshotResult {
  scores: SnapshotScores;
  composite: number;
  verdict: string;
  narrative: string;
}

const SCORE_DIMENSIONS: Record<keyof SnapshotScores, string> = {
  population_momentum: 'Population Momentum — growth rate, migration trends, demographic trajectory',
  supply_demand_gap: 'Supply/Demand Gap — unmet demand vs. existing inventory in the asset class',
  barrier_to_entry: 'Barrier to Entry — zoning difficulty, land cost, entitlement timeline, NIMBYism',
  economic_diversity: 'Economic Diversity — employer concentration, industry mix, resilience',
  competitive_saturation: 'Competitive Saturation — existing operator count, new pipeline, pricing pressure (higher = LESS saturated = better)',
  infrastructure_access: 'Infrastructure & Access — highway, airport, broadband, utility capacity',
};

export async function generateMarketSnapshot(
  location: string,
  recentIntel: string[],
  assetType?: string,
  keywords?: string[],
): Promise<SnapshotResult> {
  const sector = assetType || 'commercial real estate';
  const keywordClause = keywords?.length
    ? `\n\nThe user is particularly interested in these focus areas: ${keywords.join(', ')}.`
    : '';

  const context = recentIntel.length
    ? `\n\nRecent intelligence from this area:\n${recentIntel.join('\n')}`
    : '';

  const scoreDimDesc = Object.entries(SCORE_DIMENSIONS)
    .map(([key, desc]) => `  - "${key}": ${desc}`)
    .join('\n');

  const system = `You are a commercial real estate market analyst. Generate a market snapshot for investor pitch materials focused on the **${sector}** sector.

IMPORTANT: Your response MUST begin with a fenced JSON block containing viability scores, then the markdown narrative. Scores are 0–100 (higher = more attractive for investment).

Scoring dimensions:
${scoreDimDesc}

Return format — this exact structure, no deviation:

\`\`\`json
{
  "scores": {
    "population_momentum": <0-100>,
    "supply_demand_gap": <0-100>,
    "barrier_to_entry": <0-100>,
    "economic_diversity": <0-100>,
    "competitive_saturation": <0-100>,
    "infrastructure_access": <0-100>
  },
  "composite": <weighted average, rounded>,
  "verdict": "<one short phrase: Strong Opportunity / Moderate Opportunity / Proceed with Caution / High Risk>"
}
\`\`\`

Then write the narrative with these sections:
1. **Market Overview** — population, growth trends, economic drivers
2. **${sector} Supply** — existing supply, development pipeline, absorption
3. **Demand Indicators** — growth drivers specific to ${sector}
4. **Competitive Landscape** — major operators, recent transactions, pricing
5. **Investment Thesis** — why this market is or isn't attractive for ${sector}
6. **Key Risks** — specific, concrete risks an investor should underwrite

Use specific numbers where possible. Be analytical, not promotional. Use markdown with ## for section headings and - for bullet points.`;

  const userMessage = `Generate a ${sector} market snapshot for: ${location}${keywordClause}${context}`;

  const raw = await generateText(system, userMessage, 3000, 'speed');
  return parseSnapshotResponse(raw);
}

function parseSnapshotResponse(raw: string): SnapshotResult {
  const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/);

  const defaults: SnapshotResult = {
    scores: {
      population_momentum: 50,
      supply_demand_gap: 50,
      barrier_to_entry: 50,
      economic_diversity: 50,
      competitive_saturation: 50,
      infrastructure_access: 50,
    },
    composite: 50,
    verdict: 'Unable to score',
    narrative: raw,
  };

  if (!jsonMatch) return defaults;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    const scores: SnapshotScores = {
      population_momentum: clamp(parsed.scores?.population_momentum),
      supply_demand_gap: clamp(parsed.scores?.supply_demand_gap),
      barrier_to_entry: clamp(parsed.scores?.barrier_to_entry),
      economic_diversity: clamp(parsed.scores?.economic_diversity),
      competitive_saturation: clamp(parsed.scores?.competitive_saturation),
      infrastructure_access: clamp(parsed.scores?.infrastructure_access),
    };

    const composite = clamp(
      parsed.composite ??
        Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6),
    );

    const narrative = raw.replace(/```json[\s\S]*?```\s*/, '').trim();

    return {
      scores,
      composite,
      verdict: parsed.verdict ?? 'See analysis',
      narrative,
    };
  } catch {
    return defaults;
  }
}

function clamp(n: unknown): number {
  const v = typeof n === 'number' ? n : 50;
  return Math.max(0, Math.min(100, Math.round(v)));
}
