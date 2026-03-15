import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { queryOne } from '@/lib/db';
import { logEmail, buildEmailHtml, stripHtml, getFromHeader, fetchEmailAccounts, DEFAULT_FROM_EMAIL } from '@/lib/email';

const getResend = () => new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thread_id, to_email, to_name, subject, reply_body, reply_html, from_email } = body;
    const accounts = await fetchEmailAccounts();

    if (!thread_id || !to_email || (!reply_body && !reply_html)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const senderEmail = from_email || DEFAULT_FROM_EMAIL;
    const customerName = to_name || to_email.split('@')[0];
    const replySubject = subject?.startsWith('Re:') ? subject : `Re: ${subject || 'Your inquiry'}`;
    const plainText = reply_body || stripHtml(reply_html || '');
    const html = buildEmailHtml(customerName, reply_html || (reply_body || '').replace(/\n/g, '<br>'), subject || 'Your inquiry', senderEmail);

    // Get In-Reply-To for email threading
    let inReplyToHeader: string | undefined;
    const lastMsg = await queryOne<{ resend_message_id: string }>(
      `SELECT resend_message_id FROM email_messages
       WHERE thread_id = $1 AND resend_message_id IS NOT NULL
       ORDER BY created_at DESC LIMIT 1`,
      [thread_id]
    );
    if (lastMsg?.resend_message_id) {
      inReplyToHeader = `<${lastMsg.resend_message_id}@resend.dev>`;
    }

    const r = getResend();
    const params: Parameters<typeof r.emails.send>[0] = {
      from: getFromHeader(senderEmail, accounts),
      to: [to_email],
      subject: replySubject,
      html,
    };
    if (inReplyToHeader) {
      params.headers = { 'In-Reply-To': inReplyToHeader, 'References': inReplyToHeader };
    }

    const { data, error } = await r.emails.send(params);
    if (error) {
      console.error('Resend error:', JSON.stringify(error));
      return NextResponse.json({ error: 'Failed to send', detail: error }, { status: 500 });
    }

    const logged = await logEmail({
      thread_id,
      direction: 'outbound',
      from_email: senderEmail,
      to_email,
      subject: replySubject,
      body_html: html,
      body_text: plainText,
      resend_message_id: data?.id,
      folder: 'sent',
    });

    return NextResponse.json({ success: true, message_id: logged?.id, resend_id: data?.id });
  } catch (err: unknown) {
    console.error('Reply route error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Server error', detail: msg }, { status: 500 });
  }
}
