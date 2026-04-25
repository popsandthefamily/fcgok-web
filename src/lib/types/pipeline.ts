// Types for Phase 2: Capital CRM — pipeline rows + activity timeline.
// Mirrors columns in supabase-migrations/006_capital_crm.sql.

export type PipelineStage =
  | 'identified'
  | 'researched'
  | 'intro_requested'
  | 'contacted'
  | 'nda_sent'
  | 'data_room_viewed'
  | 'diligence'
  | 'verbal_interest'
  | 'soft_circle'
  | 'committed'
  | 'passed';

export const PIPELINE_STAGES: PipelineStage[] = [
  'identified',
  'researched',
  'intro_requested',
  'contacted',
  'nda_sent',
  'data_room_viewed',
  'diligence',
  'verbal_interest',
  'soft_circle',
  'committed',
  'passed',
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  identified: 'Identified',
  researched: 'Researched',
  intro_requested: 'Intro requested',
  contacted: 'Contacted',
  nda_sent: 'NDA sent',
  data_room_viewed: 'Data room viewed',
  diligence: 'Diligence',
  verbal_interest: 'Verbal interest',
  soft_circle: 'Soft circle',
  committed: 'Committed',
  passed: 'Passed',
};

export type PipelinePriority = 'low' | 'normal' | 'high';

export interface RaisePipelineRow {
  id: string;
  raise_id: string;
  entity_id: string;
  organization_id: string;

  stage: PipelineStage;
  committed_amount_usd: number | null;
  passed_reason: string | null;

  assignee_id: string | null;
  next_action: string | null;
  next_action_due_at: string | null;
  priority: PipelinePriority;

  notes: string | null;

  added_at: string;
  last_stage_change_at: string;
  updated_at: string;
}

export type PipelineEventType =
  | 'pipeline_added'
  | 'stage_change'
  | 'note_added'
  | 'task_added'
  | 'task_completed'
  | 'outreach_sent'
  | 'outreach_replied'
  | 'document_shared'
  | 'engagement'
  | 'pipeline_removed';

export interface RaisePipelineEvent {
  id: string;
  pipeline_id: string;
  organization_id: string;
  event_type: PipelineEventType;
  from_stage: PipelineStage | null;
  to_stage: PipelineStage | null;
  actor_id: string | null;
  payload: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}
