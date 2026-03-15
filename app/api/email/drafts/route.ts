import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { DEFAULT_FROM_EMAIL } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draft_id, to_email, subject, body_html, body_text, cc_emails, bcc_emails } = body;

    if (draft_id) {
      const data = await execute(
        `UPDATE email_messages SET
          to_email = $1, subject = $2, body_html = $3, body_text = $4,
          cc_emails = $5, bcc_emails = $6, updated_at = NOW()
        WHERE id = $7 AND is_draft = true RETURNING *`,
        [to_email || '', subject || '(no subject)', body_html, body_text, cc_emails || [], bcc_emails || [], draft_id]
      );
      if (!data) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      return NextResponse.json({ draft: data });
    }

    const data = await execute(
      `INSERT INTO email_messages (
        direction, from_email, to_email, subject, body_html, body_text,
        folder, is_draft, read, cc_emails, bcc_emails
      ) VALUES (
        'outbound', $1, $2, $3, $4, $5,
        'drafts', true, true, $6, $7
      ) RETURNING *`,
      [DEFAULT_FROM_EMAIL, to_email || '', subject || '(no subject)', body_html, body_text, cc_emails || [], bcc_emails || []]
    );

    return NextResponse.json({ draft: data });
  } catch (err: unknown) {
    console.error('Drafts route error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
