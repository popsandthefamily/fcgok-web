// ── Intel Items ──────────────────────────────────────────────

export type IntelSource =
  | 'linkedin'
  | 'reddit'
  | 'biggerpockets'
  | 'iss'
  | 'sec'
  | 'news'
  | 'podcast';

export type IntelCategory =
  | 'market_intel'
  | 'investor_activity'
  | 'deal_flow'
  | 'regulatory'
  | 'competitive'
  | 'operational';

export type Sentiment = 'bullish' | 'bearish' | 'neutral' | 'mixed';

export interface AIAnalysis {
  summary: string;
  relevance_score: number;
  category: IntelCategory;
  entities: {
    companies: string[];
    people: string[];
    locations: string[];
    dollar_amounts: string[];
    cap_rates: string[];
    fund_names: string[];
  };
  tags: string[];
  sentiment: Sentiment;
  action_items: string[];
  investor_signals: string[];
}

export interface IntelItem {
  id: string;
  source: IntelSource;
  source_url: string | null;
  title: string;
  body: string | null;
  summary: string | null;
  ai_analysis: AIAnalysis | null;
  author: string | null;
  published_at: string | null;
  ingested_at: string;
  category: IntelCategory | null;
  relevance_score: number | null;
  entities: AIAnalysis['entities'] | null;
  tags: string[] | null;
  is_curated: boolean;
  client_visibility: string[];
  metadata: Record<string, unknown> | null;
}

// ── Tracked Entities ─────────────────────────────────────────

export type EntityType = 'company' | 'person' | 'fund';

export type EntityCategory =
  | 'lender'
  | 'equity_investor'
  | 'broker'
  | 'developer'
  | 'operator'
  | 'reit';

export type EntityStatus =
  | 'active'
  | 'watching'
  | 'contacted'
  | 'engaged'
  | 'passed';

export interface TrackedEntity {
  id: string;
  name: string;
  entity_type: EntityType;
  description: string | null;
  linkedin_url: string | null;
  website: string | null;
  categories: EntityCategory[];
  geography: string[];
  deal_size_min: number | null;
  deal_size_max: number | null;
  status: EntityStatus;
  notes: string | null;
  last_activity_at: string | null;
  activity_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EntityIntelLink {
  entity_id: string;
  intel_item_id: string;
  relationship: 'mentioned' | 'authored' | 'subject' | 'counterparty';
}

// ── Organizations & Users ────────────────────────────────────

export type SubscriptionTier = 'standard' | 'premium';
export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: SubscriptionTier;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  organization_id: string | null;
  role: UserRole;
  preferences: Record<string, unknown>;
  created_at: string;
}

// ── Comps ───────────────────────────────────────────────────

export type CompSource = 'manual' | 'ai_extracted' | 'imported';

export interface Comp {
  id: string;
  organization_id: string;
  property_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  sale_price: number | null;
  sale_date: string | null;
  buyer: string | null;
  seller: string | null;
  asset_type: string | null;
  units: number | null;
  square_feet: number | null;
  lot_acres: number | null;
  year_built: number | null;
  price_per_unit: number | null;
  price_per_sf: number | null;
  cap_rate: number | null;
  noi: number | null;
  source: CompSource;
  source_intel_id: string | null;
  notes: string | null;
  verified: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Portal Events ────────────────────────────────────────────

export type EventType = 'view' | 'save' | 'click_through' | 'search' | 'export';

export interface PortalEvent {
  id: string;
  user_id: string;
  event_type: EventType;
  intel_item_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ── Weekly Digest ────────────────────────────────────────────

export interface WeeklyDigest {
  id: string;
  week_start: string;
  week_end: string;
  content: string;
  item_count: number;
  generated_at: string;
  sent_at: string | null;
}

// ── Feed Filters ─────────────────────────────────────────────

export interface FeedFilters {
  source?: IntelSource[];
  category?: IntelCategory[];
  sentiment?: Sentiment[];
  relevance_min?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  entity?: string;
  tags?: string[];
  curated_only?: boolean;
}
