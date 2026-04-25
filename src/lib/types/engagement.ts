// Types for Phase 3: Engagement Tracking.
// Mirrors columns in supabase-migrations/007_engagement_tracking.sql.

export type SharedAssetType =
  | 'pitch_deck'
  | 'om'
  | 'data_room'
  | 'market_snapshot'
  | 'comps'
  | 'followup_link'
  | 'other';

export const SHARED_ASSET_TYPES: SharedAssetType[] = [
  'pitch_deck',
  'om',
  'data_room',
  'market_snapshot',
  'comps',
  'followup_link',
  'other',
];

export const SHARED_ASSET_TYPE_LABELS: Record<SharedAssetType, string> = {
  pitch_deck: 'Pitch deck',
  om: 'Offering memorandum',
  data_room: 'Data room',
  market_snapshot: 'Market snapshot',
  comps: 'Comps',
  followup_link: 'Follow-up link',
  other: 'Other',
};

export interface SharedAssetRef {
  document_id?: string;
  storage_path?: string;
  external_url?: string;
}

export interface SharedAsset {
  id: string;
  token: string;
  organization_id: string;
  pipeline_id: string;
  raise_id: string;
  entity_id: string;
  asset_type: SharedAssetType;
  asset_ref: SharedAssetRef;
  created_by: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export type EngagementEventType =
  | 'email_open'
  | 'link_click'
  | 'document_view'
  | 'document_download'
  | 'page_view'
  | 'section_view'
  | 'data_room_login'
  | 'data_room_file_view';

export interface EngagementEvent {
  id: string;
  shared_asset_id: string | null;
  pipeline_id: string;
  organization_id: string;
  event_type: EngagementEventType;
  event_subtype: string | null;
  ip_inet: string | null;
  user_agent: string | null;
  referer: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface EngagementRollup {
  pipeline_id: string;
  organization_id: string;
  deck_views: number;
  om_views: number;
  data_room_visits: number;
  email_opens: number;
  link_clicks: number;
  last_engagement_at: string | null;
  updated_at: string;
}
