import { generateText } from './provider';
import type { DealFacts, DocumentSection, DocumentType } from '@/lib/types/documents';
import type { OrgConfig } from '@/lib/config/industries';

interface SectionDef {
  id: string;
  title: string;
  order: number;
  instruction: (facts: DealFacts, industry: string, role: string, intel: string) => string;
  maxTokens: number;
}

function formatMoney(n: number | undefined): string {
  if (n === undefined) return 'TBD';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function dealSummary(f: DealFacts): string {
  return [
    f.deal_name && `Deal: ${f.deal_name}`,
    f.property_type && `Property type: ${f.property_type}`,
    f.asset_class && `Asset class: ${f.asset_class}`,
    (f.city || f.state) && `Location: ${[f.city, f.state].filter(Boolean).join(', ')}`,
    f.msa && `MSA: ${f.msa}`,
    f.total_sf && `${f.total_sf.toLocaleString()} SF`,
    f.units && `${f.units} units`,
    f.land_acres && `${f.land_acres} acres`,
    f.total_project_cost && `Total project cost: ${formatMoney(f.total_project_cost)}`,
    f.loan_amount && `Loan: ${formatMoney(f.loan_amount)}`,
    f.equity_required && `Equity required: ${formatMoney(f.equity_required)}`,
    f.stabilized_noi && `Stabilized NOI: ${formatMoney(f.stabilized_noi)}`,
    f.exit_cap_rate && `Exit cap: ${f.exit_cap_rate}%`,
    f.projected_irr && `Projected IRR: ${f.projected_irr}%`,
    f.equity_multiple && `Equity multiple: ${f.equity_multiple}x`,
    f.hold_period_years && `Hold period: ${f.hold_period_years} years`,
    f.minimum_investment && `Min investment: ${formatMoney(f.minimum_investment)}`,
    f.preferred_return_pct && `Preferred return: ${f.preferred_return_pct}%`,
    f.promote_structure && `Promote: ${f.promote_structure}`,
  ].filter(Boolean).join('\n');
}

const OM_SECTIONS: SectionDef[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    order: 1,
    maxTokens: 600,
    instruction: (f, industry, role, intel) => `Write an Executive Summary (2-3 paragraphs) for an Offering Memorandum for this ${industry} deal. It should hook the investor with the thesis, headline returns, and what makes this deal differentiated. Be direct and specific.

DEAL FACTS:
${dealSummary(f)}

${f.investment_thesis ? `\nSponsor's stated thesis: ${f.investment_thesis}` : ''}
${intel ? `\nRELEVANT MARKET INTEL:\n${intel}` : ''}

Write in third person, present tense. Use specific numbers. No fluff. Return only the section body as markdown (no heading).`,
  },
  {
    id: 'investment-thesis',
    title: 'Investment Thesis',
    order: 2,
    maxTokens: 800,
    instruction: (f, industry, role, intel) => `Write an Investment Thesis section for an ${industry} ${role} offering. 3-4 paragraphs. Explain WHY this deal works: market timing, supply/demand, sponsor edge, structural advantages. Reference specific data points.

DEAL FACTS:
${dealSummary(f)}

${f.investment_thesis ? `\nSponsor's stated thesis: ${f.investment_thesis}` : ''}
${intel ? `\nMARKET INTEL TO REFERENCE:\n${intel}` : ''}

Return only markdown, no section heading.`,
  },
  {
    id: 'market-overview',
    title: 'Market Overview',
    order: 3,
    maxTokens: 800,
    instruction: (f, industry, role, intel) => `Write a Market Overview section for ${f.city ?? 'the target market'}, ${f.state ?? ''}. Cover: MSA demographics, population growth, economic drivers, ${industry} supply and demand, recent transactions, and why this market is attractive for ${industry} investment.

${intel ? `\nRECENT MARKET INTEL:\n${intel}` : ''}

Use specific numbers and data points where possible. Return only markdown, no section heading.`,
  },
  {
    id: 'property-details',
    title: 'Property Details',
    order: 4,
    maxTokens: 500,
    instruction: (f) => `Write a Property Details section. Describe the physical property and its key specs. Keep it factual and concise.

${dealSummary(f)}

Use bullet points for specs where appropriate. Return only markdown, no section heading.`,
  },
  {
    id: 'financial-highlights',
    title: 'Financial Highlights',
    order: 5,
    maxTokens: 700,
    instruction: (f) => `Write a Financial Highlights section. Summarize the returns profile, sources and uses, projected NOI growth, and exit assumptions. Use bullet points or a simple markdown table.

${dealSummary(f)}

Be analytical, not promotional. Return only markdown, no section heading.`,
  },
  {
    id: 'risk-factors',
    title: 'Risk Factors',
    order: 6,
    maxTokens: 700,
    instruction: (f, industry) => `Write a Risk Factors section for a ${industry} investment. Cover 5-8 specific risks with brief explanations. Include: construction/entitlement risk, lease-up risk, interest rate risk, market risk, operational risk, and sponsor-specific risks.

${dealSummary(f)}

${f.risk_summary ? `\nSponsor noted these risks: ${f.risk_summary}` : ''}

Use markdown bullet points. Return only markdown, no section heading.`,
  },
  {
    id: 'exit-strategy',
    title: 'Exit Strategy',
    order: 7,
    maxTokens: 500,
    instruction: (f, industry) => `Write an Exit Strategy section. Explain the planned exit for this ${industry} deal: sale to institutional buyer, refinance-and-hold, portfolio sale, etc. Reference current cap rate environment and buyer universe.

${dealSummary(f)}

${f.exit_strategy ? `\nSponsor's preferred exit: ${f.exit_strategy}` : ''}

Return only markdown, no section heading.`,
  },
  {
    id: 'sponsor-overview',
    title: 'Sponsor Overview',
    order: 8,
    maxTokens: 500,
    instruction: (f) => `Write a Sponsor Overview section. Highlight experience, track record, and relevant credentials.

${f.sponsor_highlights ? `Sponsor info: ${f.sponsor_highlights}` : 'The sponsor is an experienced operator in this asset class with a track record of successful deals. Write a generic but professional overview.'}

Keep it confident and specific. Return only markdown, no section heading.`,
  },
];

const PROSPECTUS_SECTIONS: SectionDef[] = OM_SECTIONS.filter((s) =>
  ['executive-summary', 'investment-thesis', 'financial-highlights', 'sponsor-overview'].includes(s.id),
).map((s, i) => ({ ...s, order: i + 1 }));

const PITCH_DECK_SECTIONS: SectionDef[] = [
  {
    id: 'opportunity',
    title: 'The Opportunity',
    order: 1,
    maxTokens: 300,
    instruction: (f, industry) => `One paragraph (50-80 words) hook for a pitch deck slide. What's the opportunity, in plain language, for this ${industry} deal? Make an investor lean in.

${dealSummary(f)}

Return only markdown.`,
  },
  {
    id: 'market',
    title: 'Market',
    order: 2,
    maxTokens: 400,
    instruction: (f, industry, role, intel) => `3-4 bullet points for a Market slide in a ${industry} pitch deck. Headline numbers only (population, growth, supply gap, recent transactions).

${dealSummary(f)}

${intel ? `Market intel: ${intel}` : ''}

Return only markdown bullets.`,
  },
  {
    id: 'the-deal',
    title: 'The Deal',
    order: 3,
    maxTokens: 400,
    instruction: (f) => `Bullet points for The Deal slide: property specs, total project cost, equity required, returns profile.

${dealSummary(f)}

Return only markdown bullets. Be terse.`,
  },
  {
    id: 'returns',
    title: 'Returns',
    order: 4,
    maxTokens: 400,
    instruction: (f) => `Write a Returns slide. 4-6 bullet points covering IRR, equity multiple, preferred return, cash-on-cash, hold period, exit strategy.

${dealSummary(f)}

Return only markdown bullets.`,
  },
  {
    id: 'team',
    title: 'Team',
    order: 5,
    maxTokens: 300,
    instruction: (f) => `One paragraph sponsor/team bio for a pitch deck Team slide.

${f.sponsor_highlights ?? 'Experienced sponsor with a track record in this asset class.'}

Return only markdown.`,
  },
  {
    id: 'next-steps',
    title: 'Next Steps',
    order: 6,
    maxTokens: 200,
    instruction: () => `Write a Next Steps slide: 3-4 bullet points on how interested investors move forward (sign NDA, review OM, book call, indicate interest amount). Return only markdown bullets.`,
  },
];

export function getSectionsForType(type: DocumentType): SectionDef[] {
  if (type === 'om') return OM_SECTIONS;
  if (type === 'prospectus') return PROSPECTUS_SECTIONS;
  return PITCH_DECK_SECTIONS;
}

export async function generateDocumentSections(
  type: DocumentType,
  facts: DealFacts,
  orgConfig: OrgConfig,
  intelContext = '',
): Promise<DocumentSection[]> {
  const sectionDefs = getSectionsForType(type);
  const industry = orgConfig.industry;
  const role = orgConfig.primary_role;

  // Generate all sections in parallel for speed
  const results = await Promise.allSettled(
    sectionDefs.map(async (def) => {
      const systemPrompt = `You are a commercial real estate writer creating an ${type.toUpperCase()} for a ${industry} ${role}. Write clearly and confidently. Use specific numbers. No marketing fluff. Output clean markdown with no heading (the heading is added separately).`;
      const userPrompt = def.instruction(facts, industry, role, intelContext);

      const content = await generateText(systemPrompt, userPrompt, def.maxTokens, 'speed');
      return {
        id: def.id,
        title: def.title,
        order: def.order,
        content: content.trim(),
        generated_at: new Date().toISOString(),
      } as DocumentSection;
    }),
  );

  const sections: DocumentSection[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      sections.push(r.value);
    } else {
      // Include a placeholder for failed sections so the order is preserved
      sections.push({
        id: sectionDefs[i].id,
        title: sectionDefs[i].title,
        order: sectionDefs[i].order,
        content: `_Generation failed: ${r.reason instanceof Error ? r.reason.message : String(r.reason)}_`,
        generated_at: new Date().toISOString(),
      });
    }
  });

  return sections.sort((a, b) => a.order - b.order);
}
