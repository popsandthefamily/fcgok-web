// Industry presets for portal setup wizard.
// Each preset provides sensible defaults for keywords, companies,
// and RSS feeds. Users can customize after selection.

export type Industry =
  | 'self-storage'
  | 'multi-family'
  | 'industrial'
  | 'retail'
  | 'office'
  | 'hospitality'
  | 'mixed';

export type PrimaryRole =
  | 'developer'
  | 'operator'
  | 'investor'
  | 'broker'
  | 'lender'
  | 'consultant';

export interface IndustryPreset {
  industry: Industry;
  label: string;
  description: string;
  keywords: string[];
  target_companies: string[];
  custom_rss_feeds: { name: string; url: string }[];
}

export const INDUSTRY_PRESETS: Record<Industry, IndustryPreset> = {
  'self-storage': {
    industry: 'self-storage',
    label: 'Self-Storage',
    description: 'Ground-up development, acquisitions, and operations of self-storage facilities',
    keywords: [
      'self storage',
      'self-storage',
      'storage facility',
      'climate controlled',
      'cap rate',
      'net rentable square feet',
      'street rate',
      'REIT',
      'construction loan',
      'SBA 504',
      'opportunity zone',
      '1031 exchange',
      'syndication',
    ],
    target_companies: [
      'Public Storage',
      'Extra Space Storage',
      'CubeSmart',
      'National Storage Affiliates',
      'SROA Capital',
      'DXD Capital',
      'Life Storage',
      'Madison Capital Group',
      'BSC Group',
      'Cedar Creek Capital',
      'SkyView Advisors',
      'Argus Self Storage',
      'Marcus & Millichap',
    ],
    custom_rss_feeds: [
      { name: 'Inside Self-Storage', url: 'https://www.insideselfstorage.com/rss.xml' },
    ],
  },
  'multi-family': {
    industry: 'multi-family',
    label: 'Multi-Family',
    description: 'Apartments, workforce housing, build-to-rent, and multifamily development',
    keywords: [
      'multifamily',
      'apartment',
      'workforce housing',
      'build to rent',
      'BTR',
      'rent growth',
      'occupancy',
      'cap rate',
      'value-add',
      'syndication',
      'opportunity zone',
      '1031 exchange',
      'LIHTC',
      'Class A',
      'Class B',
    ],
    target_companies: [
      'Greystar',
      'Equity Residential',
      'AvalonBay',
      'Camden Property Trust',
      'Mid-America Apartment',
      'UDR',
      'MAA',
      'Harbor Group International',
      'Cortland',
      'Tishman Speyer',
    ],
    custom_rss_feeds: [
      { name: 'MultiHousing News', url: 'https://www.multihousingnews.com/feed/' },
    ],
  },
  industrial: {
    industry: 'industrial',
    label: 'Industrial',
    description: 'Warehouses, logistics, cold storage, and industrial outdoor storage',
    keywords: [
      'industrial',
      'warehouse',
      'logistics',
      'cold storage',
      'last mile',
      'IOS',
      'industrial outdoor storage',
      'cap rate',
      'cross-dock',
      'distribution center',
      'triple net',
    ],
    target_companies: [
      'Prologis',
      'Duke Realty',
      'EastGroup Properties',
      'Rexford Industrial',
      'STAG Industrial',
      'First Industrial Realty',
      'Terreno Realty',
      'Lineage Logistics',
      'Americold',
    ],
    custom_rss_feeds: [],
  },
  retail: {
    industry: 'retail',
    label: 'Retail',
    description: 'Shopping centers, strip malls, NNN lease, and retail development',
    keywords: [
      'retail',
      'shopping center',
      'strip mall',
      'NNN',
      'triple net',
      'single tenant',
      'grocery anchored',
      'power center',
      'cap rate',
      '1031 exchange',
    ],
    target_companies: [
      'Simon Property Group',
      'Kimco Realty',
      'Regency Centers',
      'Federal Realty',
      'Brixmor',
      'Realty Income',
      'Spirit Realty',
      'Agree Realty',
    ],
    custom_rss_feeds: [],
  },
  office: {
    industry: 'office',
    label: 'Office',
    description: 'Class A office, medical office, flex space, and office redevelopment',
    keywords: [
      'office',
      'Class A office',
      'medical office',
      'MOB',
      'flex space',
      'coworking',
      'occupancy rate',
      'absorption',
      'cap rate',
      'sublease',
    ],
    target_companies: [
      'Boston Properties',
      'Vornado',
      'SL Green',
      'Kilroy Realty',
      'Alexandria Real Estate',
      'Cousins Properties',
      'Healthcare Realty',
    ],
    custom_rss_feeds: [],
  },
  hospitality: {
    industry: 'hospitality',
    label: 'Hospitality',
    description: 'Hotels, short-term rentals, boutique properties, and hospitality development',
    keywords: [
      'hotel',
      'hospitality',
      'short term rental',
      'STR',
      'boutique hotel',
      'ADR',
      'RevPAR',
      'occupancy',
      'flag',
      'branded residence',
    ],
    target_companies: [
      'Marriott',
      'Hilton',
      'Hyatt',
      'Host Hotels',
      'Park Hotels',
      'Apple Hospitality',
      'Summit Hotel Properties',
    ],
    custom_rss_feeds: [],
  },
  mixed: {
    industry: 'mixed',
    label: 'Mixed / Multi-Asset',
    description: 'Diversified CRE strategies across multiple asset classes',
    keywords: [
      'commercial real estate',
      'CRE',
      'cap rate',
      'IRR',
      'syndication',
      'opportunity zone',
      '1031 exchange',
      'capital raise',
    ],
    target_companies: [
      'Blackstone',
      'Brookfield',
      'Starwood Capital',
      'KKR',
      'Apollo Global',
      'Carlyle Group',
    ],
    custom_rss_feeds: [],
  },
};

export interface OrgConfig {
  industry: Industry;
  primary_role: PrimaryRole;
  deal_profile: {
    size_min?: number;
    size_max?: number;
    cap_rate_target?: number;
    geography: string[];
  };
  intel: {
    keywords: string[];
    target_companies: string[];
    target_people: string[];
  };
  sources: {
    iss: boolean;
    news: boolean;
    sec: boolean;
    biggerpockets: boolean;
    podcasts: boolean;
    'edgar-distress': boolean;
  };
  custom_rss_feeds: { name: string; url: string }[];
  brand?: {
    logo_url?: string;
    brand_primary?: string;
    brand_secondary?: string;
    tagline?: string;
  };
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
}

export function defaultConfigForIndustry(
  industry: Industry,
  role: PrimaryRole = 'developer',
): OrgConfig {
  const preset = INDUSTRY_PRESETS[industry];
  return {
    industry,
    primary_role: role,
    deal_profile: {
      geography: [],
    },
    intel: {
      keywords: preset.keywords,
      target_companies: preset.target_companies,
      target_people: [],
    },
    sources: {
      iss: industry === 'self-storage',
      news: true,
      sec: true,
      biggerpockets: true,
      podcasts: true,
      'edgar-distress': industry === 'self-storage',
    },
    custom_rss_feeds: preset.custom_rss_feeds,
    onboarding_completed: false,
  };
}
