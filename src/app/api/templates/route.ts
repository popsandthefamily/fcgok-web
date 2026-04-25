import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAuthedUser } from '@/lib/supabase/auth-helper';

const SEED_TEMPLATES = [
  {
    category: 'Cold Outreach (LP)',
    title: 'Initial LP Introduction',
    subject: 'Self-Storage Opportunity in {{market}} - {{company}}',
    body: `Hi {{first_name}},

I came across {{company_name}} and your focus on {{investment_focus}}. {{company}} is actively pursuing self-storage acquisitions in {{market}}, and I believe there may be alignment with your allocation strategy.

We are targeting {{deal_size}} deals with {{return_profile}} returns, backed by strong demographic tailwinds and operational upside.

Would you be open to a brief call this week to explore potential fit?

Best regards,
{{sender_name}}
{{company}}`,
  },
  {
    category: 'Follow-Up',
    title: 'Post-Meeting Follow-Up',
    subject: 'Following Up - {{deal_name}} Discussion',
    body: `Hi {{first_name}},

Thank you for taking the time to speak with me on {{meeting_date}}. I appreciated learning more about {{company_name}}'s approach to {{investment_focus}}.

As discussed, I have attached {{attachment_description}} for your review. Key highlights:

- {{highlight_1}}
- {{highlight_2}}
- {{highlight_3}}

Please let me know if you have any questions or would like to schedule a follow-up conversation.

Best regards,
{{sender_name}}
{{company}}`,
  },
  {
    category: 'Introduction Request',
    title: 'Warm Introduction Request',
    subject: 'Introduction Request - {{target_name}} at {{target_company}}',
    body: `Hi {{connector_name}},

I hope this message finds you well. I am reaching out because I noticed your connection to {{target_name}} at {{target_company}}.

{{company}} is expanding its self-storage portfolio in {{market}} and I believe {{target_company}} could be a strong capital partner given their focus on {{target_focus}}.

Would you be comfortable making a brief introduction? I am happy to draft a forwardable blurb if that makes it easier.

Thank you in advance,
{{sender_name}}
{{company}}`,
  },
  {
    category: 'Deal Update',
    title: 'Investor Deal Update',
    subject: 'Deal Update: {{deal_name}} - {{month}} {{year}}',
    body: `Hi {{first_name}},

Here is your monthly update on {{deal_name}}:

Status: {{deal_status}}
Occupancy: {{occupancy_rate}}
NOI (trailing): {{trailing_noi}}
CapEx Progress: {{capex_status}}

Key developments this period:
- {{update_1}}
- {{update_2}}

Next steps:
- {{next_step_1}}
- {{next_step_2}}

Full financials are available in the investor portal. Please reach out with any questions.

Best regards,
{{sender_name}}
{{company}}`,
  },
];

export async function GET() {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const supabase = await createServiceClient();

  const templatesRes = await supabase
    .from('outreach_templates')
    .select('*')
    .eq('organization_id', auth.orgId)
    .order('created_at', { ascending: true });
  let templates = templatesRes.data;
  const error = templatesRes.error;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!templates || templates.length === 0) {
    const seedRows = SEED_TEMPLATES.map((t) => ({
      ...t,
      organization_id: auth.orgId,
      created_by: auth.id,
      is_seed: true,
    }));
    const { data: inserted, error: seedError } = await supabase
      .from('outreach_templates')
      .insert(seedRows)
      .select();
    if (seedError) return NextResponse.json({ error: seedError.message }, { status: 500 });
    templates = inserted;
  }

  const templateIds = (templates ?? []).map((t) => t.id);
  let sendStats: Record<string, { sent: number; replied: number }> = {};
  if (templateIds.length > 0) {
    const { data: sends } = await supabase
      .from('outreach_sends')
      .select('template_id, replied_at')
      .in('template_id', templateIds);
    sendStats = (sends ?? []).reduce((acc, s) => {
      const key = s.template_id as string;
      if (!acc[key]) acc[key] = { sent: 0, replied: 0 };
      acc[key].sent += 1;
      if (s.replied_at) acc[key].replied += 1;
      return acc;
    }, {} as Record<string, { sent: number; replied: number }>);
  }

  return NextResponse.json({ templates, stats: sendStats });
}

export async function POST(request: Request) {
  const auth = await getAuthedUser();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  const body = await request.json();
  const { category, title, subject, body: templateBody } = body;

  if (!category || !title || !subject || !templateBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('outreach_templates')
    .insert({
      organization_id: auth.orgId,
      created_by: auth.id,
      category,
      title,
      subject,
      body: templateBody,
      is_seed: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data });
}
