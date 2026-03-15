// ═══════════════════════════════════════════════════════════
// CRUNCHTIME BULLIES — Email Utilities (Resend + Neon)
// ═══════════════════════════════════════════════════════════

import { query, queryOne, execute } from '@/lib/db';

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam';

export interface EmailMessage {
  id: string;
  thread_id: string;
  direction: 'outbound' | 'inbound';
  from_email: string;
  to_email: string;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  resend_message_id: string | null;
  read: boolean;
  starred: boolean;
  folder: EmailFolder;
  has_attachments: boolean;
  is_draft: boolean;
  cc_emails: string[];
  bcc_emails: string[];
  created_at: string;
  updated_at: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  id: string;
  message_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  s3_key: string;
  s3_url: string;
  created_at: string;
}

export interface EmailContact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  category: 'customer' | 'vendor' | 'breeder' | 'partner' | 'other';
  notes: string | null;
  starred: boolean;
  created_at: string;
  updated_at: string;
}

// --- Account Configuration ---
export interface EmailAccount {
  id?: string;
  email: string;
  display_name: string;
  color: string;
  initials: string;
}

const FALLBACK_ACCOUNTS: EmailAccount[] = [
  { email: 'info@crunchtymebullies.com', display_name: 'Crunchtime Bullies', color: '#D4A84C', initials: 'CB' },
];

let _cachedAccounts: EmailAccount[] | null = null;
let _cacheTime = 0;

export async function fetchEmailAccounts(): Promise<EmailAccount[]> {
  if (_cachedAccounts && Date.now() - _cacheTime < 60000) return _cachedAccounts;
  try {
    const rows = await query<EmailAccount>(
      `SELECT * FROM email_accounts WHERE active = true ORDER BY is_default DESC, email`
    );
    if (!rows.length) return FALLBACK_ACCOUNTS;
    _cachedAccounts = rows;
    _cacheTime = Date.now();
    return rows;
  } catch {
    return FALLBACK_ACCOUNTS;
  }
}

export function getEmailAccountsCached(): EmailAccount[] {
  return _cachedAccounts || FALLBACK_ACCOUNTS;
}

export const DEFAULT_FROM_EMAIL = 'info@crunchtymebullies.com';

export function getAccountConfig(email: string, accounts?: EmailAccount[]): EmailAccount {
  const list = accounts || _cachedAccounts || FALLBACK_ACCOUNTS;
  return list.find(a => a.email === email) || list[0];
}

export function getFromHeader(fromEmail: string, accounts?: EmailAccount[]): string {
  const account = getAccountConfig(fromEmail, accounts);
  return `${account.display_name} <${account.email}>`;
}

// Log an email to the database
export async function logEmail(params: {
  thread_id?: string;
  direction: 'outbound' | 'inbound';
  from_email: string;
  to_email: string;
  subject: string;
  body_html?: string;
  body_text?: string;
  resend_message_id?: string;
  folder?: EmailFolder;
  is_draft?: boolean;
  has_attachments?: boolean;
  cc_emails?: string[];
  bcc_emails?: string[];
  read?: boolean;
}): Promise<EmailMessage | null> {
  const folder = params.folder || (params.is_draft ? 'drafts' : params.direction === 'outbound' ? 'sent' : 'inbox');
  const readVal = params.read ?? (params.direction === 'outbound');

  const row = await execute(
    `INSERT INTO email_messages (
      thread_id, direction, from_email, to_email, subject,
      body_html, body_text, resend_message_id, read, folder,
      is_draft, has_attachments, cc_emails, bcc_emails
    ) VALUES (
      COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14
    ) RETURNING *`,
    [
      params.thread_id || null,
      params.direction,
      params.from_email,
      params.to_email,
      params.subject,
      params.body_html || null,
      params.body_text || null,
      params.resend_message_id || null,
      readVal,
      folder,
      params.is_draft || false,
      params.has_attachments || false,
      params.cc_emails || [],
      params.bcc_emails || [],
    ]
  );
  if (!row) { console.error('Failed to log email'); return null; }
  return row as unknown as EmailMessage;
}

// Branded HTML email template — Crunchtime Bullies identity
// Colors: black #111111, gold #D4A84C, white #FFFFFF, dark #1A1A1A
export function buildEmailHtml(toName: string, bodyHtml: string, subject: string, fromEmail?: string): string {
  const account = getAccountConfig(fromEmail || DEFAULT_FROM_EMAIL);
  const sigEmail = account.email;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body { margin: 0 !important; padding: 0 !important; background-color: #1A1A1A !important; }
    * { -webkit-text-size-adjust: none; text-size-adjust: none; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #1A1A1A !important; }
      .outer-wrap { background-color: #1A1A1A !important; }
      .body-cell { background-color: #111111 !important; color: #ffffff !important; }
      .body-text { color: #e0e0e0 !important; }
      .greeting { color: #ffffff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#1A1A1A;font-family:Arial,Helvetica,sans-serif;">

<table class="outer-wrap" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1A1A;">
  <tr>
    <td align="center" style="padding:32px 12px 48px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="height:3px;background-color:#D4A84C;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="background-color:#111111;padding:0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:24px 32px 20px;">
                  <span style="font-size:22px;font-weight:800;color:#D4A84C;letter-spacing:1px;text-transform:uppercase;">CRUNCHTIME BULLIES</span>
                </td>
                <td style="padding:24px 32px 20px;text-align:right;vertical-align:middle;white-space:nowrap;">
                  <span style="display:inline-block;border:1px solid #D4A84C;padding:4px 10px;color:#D4A84C;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Official Message</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="height:1px;background-color:#D4A84C;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="background-color:#1A1A1A;padding:20px 32px 18px;">
            <p style="margin:0 0 5px;color:#D4A84C;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">Message</p>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;letter-spacing:-0.2px;">${subject}</p>
          </td>
        </tr>
        <tr>
          <td class="body-cell" style="background-color:#111111;padding:36px 32px 28px;">
            <p class="greeting" style="margin:0 0 18px;color:#ffffff;font-size:16px;font-weight:600;">Hi ${toName},</p>
            <div class="body-text" style="color:#cccccc;font-size:15px;line-height:1.75;margin:0 0 28px;">${bodyHtml}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="width:40px;height:2px;background-color:#D4A84C;font-size:0;line-height:0;">&nbsp;</td>
                <td style="height:1px;background-color:#2a2a2a;font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:3px;background-color:#D4A84C;border-radius:2px;">&nbsp;</td>
                <td style="padding-left:12px;">
                  <p style="margin:0 0 2px;color:#ffffff;font-size:14px;font-weight:700;">Crunchtime Bullies</p>
                  <p style="margin:0 0 1px;color:#999999;font-size:12px;">American Bully Breeder &amp; Apparel</p>
                  <p style="margin:0;color:#666666;font-size:11px;">crunchtymebullies.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color:#1A1A1A;padding:20px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:10px;">
                  <a href="mailto:${sigEmail}" style="color:#D4A84C;text-decoration:none;font-size:13px;font-weight:600;">${sigEmail}</a>
                  <span style="color:#2a2a2a;font-size:13px;">&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                  <a href="https://crunchtymebullies.com" style="color:#D4A84C;text-decoration:none;font-size:13px;font-weight:600;">crunchtymebullies.com</a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;">Crunchtime Bullies &nbsp;&middot;&nbsp; American Bully Puppies &amp; Apparel</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="height:3px;background-color:#D4A84C;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
}
