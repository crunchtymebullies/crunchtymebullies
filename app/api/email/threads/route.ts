import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

interface RawMessage {
  id: string; thread_id: string; direction: string; from_email: string;
  to_email: string; subject: string; body_html: string | null;
  body_text: string | null; resend_message_id: string | null;
  read: boolean; starred: boolean; folder: string; is_draft: boolean;
  has_attachments: boolean; created_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') || 'inbox';
    const account = searchParams.get('account') || null;

    const { threads, folderCounts } = await buildThreads(folder, account);
    return NextResponse.json({ threads, folderCounts });
  } catch (err: unknown) {
    console.error('Threads GET error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function buildThreads(folder: string, account: string | null) {
  let whereClause: string;
  if (folder === 'trash') whereClause = `folder = 'trash'`;
  else if (folder === 'drafts') whereClause = `is_draft = true AND folder != 'trash'`;
  else if (folder === 'starred') whereClause = `starred = true AND folder != 'trash'`;
  else if (folder === 'sent') whereClause = `direction = 'outbound' AND is_draft = false AND folder != 'trash'`;
  else if (folder === 'spam') whereClause = `folder = 'spam'`;
  else whereClause = `is_draft = false AND folder NOT IN ('trash', 'spam')`;

  const rawMessages = await query<RawMessage>(
    `SELECT * FROM email_messages WHERE ${whereClause} ORDER BY created_at DESC`
  );

  // Account filtering
  const messages = account
    ? rawMessages.filter(msg => {
        if (folder === 'inbox') return msg.to_email === account;
        if (folder === 'sent') return msg.from_email === account;
        return msg.from_email === account || msg.to_email === account;
      })
    : rawMessages;

  // Folder counts
  const allMessages = await query<RawMessage>(
    `SELECT folder, is_draft, starred, read, direction, from_email, to_email FROM email_messages`
  );
  const countMessages = account
    ? allMessages.filter(msg => {
        if (msg.direction === 'inbound') return msg.to_email === account;
        if (msg.direction === 'outbound') return msg.from_email === account;
        return msg.from_email === account || msg.to_email === account;
      })
    : allMessages;

  const folderCounts: Record<string, number> = { inbox: 0, sent: 0, starred: 0, drafts: 0, trash: 0, spam: 0 };
  for (const msg of countMessages) {
    if (msg.is_draft && msg.folder !== 'trash') folderCounts.drafts++;
    if (msg.starred && msg.folder !== 'trash') folderCounts.starred++;
    if (msg.folder === 'trash') folderCounts.trash++;
    if (msg.folder === 'spam') folderCounts.spam++;
    if (!msg.read && msg.folder === 'inbox' && !msg.is_draft) folderCounts.inbox++;
    if (msg.direction === 'outbound' && !msg.is_draft && msg.folder !== 'trash') folderCounts.sent++;
  }

  type ThreadEntry = {
    thread_id: string; subject: string; to_email: string; from_email: string;
    latest_message: string; latest_body_preview: string; latest_direction: string;
    message_count: number; unread_count: number; starred: boolean;
    has_attachments: boolean; created_at: string; has_inbound: boolean;
  };
  const threadMap = new Map<string, ThreadEntry>();

  for (const msg of messages) {
    if (!threadMap.has(msg.thread_id)) {
      const plainText = msg.body_text || (msg.body_html || '').replace(/<[^>]+>/g, '');
      threadMap.set(msg.thread_id, {
        thread_id: msg.thread_id,
        subject: msg.subject,
        to_email: msg.direction === 'outbound' ? msg.to_email : msg.from_email,
        from_email: msg.direction === 'outbound' ? msg.from_email : msg.to_email,
        latest_message: msg.created_at,
        latest_body_preview: plainText.substring(0, 120),
        latest_direction: msg.direction,
        message_count: 0, unread_count: 0,
        starred: !!msg.starred, has_attachments: !!msg.has_attachments,
        created_at: msg.created_at, has_inbound: msg.direction === 'inbound',
      });
    }
    const thread = threadMap.get(msg.thread_id)!;
    thread.message_count++;
    if (!msg.read) thread.unread_count++;
    if (msg.starred) thread.starred = true;
    if (msg.has_attachments) thread.has_attachments = true;
    if (msg.direction === 'inbound') thread.has_inbound = true;
  }

  if (folder === 'inbox') {
    for (const [id, t] of threadMap) {
      if (!t.has_inbound) threadMap.delete(id);
    }
  }

  const threads = [...threadMap.values()].sort(
    (a, b) => new Date(b.latest_message).getTime() - new Date(a.latest_message).getTime()
  );
  return { threads, folderCounts };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thread_id, account } = body;
    if (!thread_id) return NextResponse.json({ error: 'Missing thread_id' }, { status: 400 });

    if (account) {
      const msgs = await query<{ id: string; from_email: string; to_email: string }>(
        `SELECT id, from_email, to_email FROM email_messages WHERE thread_id = $1`, [thread_id]
      );
      const ids = msgs.filter(m => m.from_email === account || m.to_email === account).map(m => m.id);
      if (ids.length > 0) {
        await execute(`UPDATE email_messages SET read = true WHERE id = ANY($1::uuid[])`, [ids]);
      }
    } else {
      await execute(`UPDATE email_messages SET read = true WHERE thread_id = $1`, [thread_id]);
    }

    const messages = await query(
      `SELECT * FROM email_messages WHERE thread_id = $1 ORDER BY created_at ASC`, [thread_id]
    );
    const filtered = account
      ? messages.filter((m: any) => m.from_email === account || m.to_email === account)
      : messages;

    const messageIds = filtered.map((m: any) => m.id);
    let attachments: any[] = [];
    if (messageIds.length > 0) {
      attachments = await query(`SELECT * FROM email_attachments WHERE message_id = ANY($1::uuid[])`, [messageIds]);
    }
    const attMap = new Map<string, any[]>();
    for (const att of attachments) {
      if (!attMap.has(att.message_id)) attMap.set(att.message_id, []);
      attMap.get(att.message_id)!.push(att);
    }
    const messagesWithAtts = filtered.map((m: any) => ({ ...m, attachments: attMap.get(m.id) || [] }));
    return NextResponse.json({ messages: messagesWithAtts });
  } catch (err: unknown) {
    console.error('Threads POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { thread_ids, action, value, account } = await req.json();
    if (!thread_ids?.length || !action) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

    const updateMap: Record<string, string> = {
      star: `starred = true`, unstar: `starred = false`,
      trash: `folder = 'trash'`, restore: `folder = 'inbox'`,
      spam: `folder = 'spam'`, mark_read: `read = true`, mark_unread: `read = false`,
    };
    const setClause = action === 'move' && value ? `folder = '${value}'` : (updateMap[action] || '');
    if (!setClause) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    if (account) {
      const msgs = await query<{ id: string; from_email: string; to_email: string }>(
        `SELECT id, from_email, to_email FROM email_messages WHERE thread_id = ANY($1::uuid[])`, [thread_ids]
      );
      const ids = msgs.filter(m => m.from_email === account || m.to_email === account).map(m => m.id);
      if (ids.length > 0) {
        await execute(`UPDATE email_messages SET ${setClause} WHERE id = ANY($1::uuid[])`, [ids]);
      }
    } else {
      await execute(`UPDATE email_messages SET ${setClause} WHERE thread_id = ANY($1::uuid[])`, [thread_ids]);
    }
    return NextResponse.json({ updated: thread_ids.length });
  } catch (err: unknown) {
    console.error('Threads PATCH error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { thread_ids, account } = await req.json();
    if (!thread_ids?.length) return NextResponse.json({ error: 'No thread_ids' }, { status: 400 });

    if (account) {
      const msgs = await query<{ id: string; from_email: string; to_email: string }>(
        `SELECT id, from_email, to_email FROM email_messages WHERE thread_id = ANY($1::uuid[])`, [thread_ids]
      );
      const ids = msgs.filter(m => m.from_email === account || m.to_email === account).map(m => m.id);
      if (ids.length > 0) {
        await execute(`DELETE FROM email_messages WHERE id = ANY($1::uuid[])`, [ids]);
      }
    } else {
      await execute(`DELETE FROM email_messages WHERE thread_id = ANY($1::uuid[])`, [thread_ids]);
    }
    return NextResponse.json({ deleted: thread_ids.length });
  } catch (err: unknown) {
    console.error('Threads DELETE error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
