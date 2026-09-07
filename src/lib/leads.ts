/** Free mailbox providers. A business email is the point of the exercise. */
const FREE_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'yandex.com',
  'hey.com', 'fastmail.com', 'tutanota.com', 'pm.me',
]);

export interface LeadInput {
  fullName: string;
  email: string;
  company: string;
  website?: string;
  teamSize?: string;
  phone?: string;
  consent: boolean;
  templateId?: string;
  colorwayId?: string;
  source?: string;
}

export interface LeadResult {
  ok: boolean;
  errors: Record<string, string>;
  clean?: Required<Pick<LeadInput, 'fullName' | 'email' | 'company'>> & LeadInput & { domain: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function validateLead(input: Partial<LeadInput>): LeadResult {
  const errors: Record<string, string> = {};
  const fullName = String(input.fullName ?? '').trim();
  const email = String(input.email ?? '').trim().toLowerCase();
  const company = String(input.company ?? '').trim();

  if (fullName.length < 2) errors.fullName = 'Tell us your name.';
  if (!EMAIL_RE.test(email)) {
    errors.email = 'That does not look like an email address.';
  } else if (FREE_DOMAINS.has(email.split('@')[1])) {
    errors.email = 'Use your work email so we can reach you at the business.';
  }
  if (company.length < 2) errors.company = 'Which business is this for?';
  if (!input.consent) errors.consent = 'We need your permission before we contact you.';

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    errors: {},
    clean: {
      fullName,
      email,
      company,
      domain: email.split('@')[1],
      website: String(input.website ?? '').trim(),
      teamSize: String(input.teamSize ?? '').trim(),
      phone: String(input.phone ?? '').trim(),
      consent: true,
      templateId: String(input.templateId ?? '').trim(),
      colorwayId: String(input.colorwayId ?? '').trim(),
      source: String(input.source ?? 'ikniteos-mail').trim(),
    },
  };
}

/* ---------- GoHighLevel ---------- */

const GHL_BASE = 'https://services.leadconnectorhq.com';

export interface GhlOutcome {
  delivered: boolean;
  contactId?: string;
  reason?: string;
}

/**
 * Upsert the lead as a GHL contact. Upsert rather than create so someone who
 * builds three signatures does not become three contacts.
 */
export async function sendToGhl(lead: NonNullable<LeadResult['clean']>): Promise<GhlOutcome> {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    return { delivered: false, reason: 'GHL not configured' };
  }

  const [firstName, ...rest] = lead.fullName.split(/\s+/);
  const tags = ['ikniteos-mail', 'signature-generator'];
  if (lead.templateId) tags.push(`template-${lead.templateId}`);

  const body = {
    locationId,
    firstName,
    lastName: rest.join(' ') || undefined,
    name: lead.fullName,
    email: lead.email,
    phone: lead.phone || undefined,
    companyName: lead.company,
    website: lead.website || undefined,
    source: lead.source || 'IkniteOS Mail',
    tags,
    customFields: [
      { key: 'team_size', field_value: lead.teamSize || '' },
      { key: 'signature_template', field_value: lead.templateId || '' },
      { key: 'email_domain', field_value: lead.domain },
      { key: 'marketing_consent_at', field_value: new Date().toISOString() },
    ].filter((f) => f.field_value),
  };

  try {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      // Never let a slow CRM hold up the person's download.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { delivered: false, reason: `GHL ${res.status}: ${text.slice(0, 200)}` };
    }
    const json = (await res.json()) as { contact?: { id?: string } };
    return { delivered: true, contactId: json?.contact?.id };
  } catch (err) {
    return { delivered: false, reason: err instanceof Error ? err.message : 'unknown error' };
  }
}
