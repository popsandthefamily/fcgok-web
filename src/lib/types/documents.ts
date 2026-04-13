export type DocumentType = 'om' | 'prospectus' | 'pitch_deck';
export type DocumentStatus = 'draft' | 'generating' | 'ready' | 'archived';
export type DocumentTemplate = 'modern' | 'classic' | 'minimal';

export interface DealFacts {
  // Property
  deal_name: string;
  asset_class?: string;
  property_type?: string;
  address?: string;
  city?: string;
  state?: string;
  msa?: string;
  total_sf?: number;
  units?: number;
  land_acres?: number;
  year_built?: number;

  // Financials
  total_project_cost?: number;
  land_cost?: number;
  construction_cost?: number;
  loan_amount?: number;
  ltc_pct?: number;
  equity_required?: number;
  stabilized_noi?: number;
  exit_cap_rate?: number;
  projected_irr?: number;
  equity_multiple?: number;
  hold_period_years?: number;

  // Deal structure
  minimum_investment?: number;
  preferred_return_pct?: number;
  promote_structure?: string;
  target_close_date?: string;

  // Narrative inputs
  investment_thesis?: string;
  sponsor_highlights?: string;
  exit_strategy?: string;
  risk_summary?: string;
}

export interface DocumentSection {
  id: string;
  title: string;
  order: number;
  content: string; // markdown
  generated_at?: string;
  edited?: boolean;
}

export interface PortalDocument {
  id: string;
  organization_id: string;
  created_by: string;
  type: DocumentType;
  deal_name: string;
  status: DocumentStatus;
  template: DocumentTemplate;
  deal_facts: DealFacts;
  sections: DocumentSection[];
  cover_image_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  om: 'Offering Memorandum',
  prospectus: 'Investor Prospectus',
  pitch_deck: 'Pitch Deck',
};

export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  om: 'Full Offering Memorandum with market analysis, financials, and risk factors',
  prospectus: 'Concise investor prospectus for early conversations',
  pitch_deck: 'Visual pitch deck for live presentations and intro meetings',
};
