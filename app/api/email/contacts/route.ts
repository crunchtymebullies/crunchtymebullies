import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    let rows;
    if (q) {
      rows = await query(
        `SELECT * FROM email_contacts WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY name`,
        [`%${q}%`]
      );
    } else {
      rows = await query(`SELECT * FROM email_contacts ORDER BY name`);
    }

    return NextResponse.json({ contacts: rows });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, contact } = body;

    if (action === 'delete') {
      await execute(`DELETE FROM email_contacts WHERE id = $1`, [contact.id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const data = await execute(
        `UPDATE email_contacts SET
          name = $1, email = $2, phone = $3, company = $4,
          category = $5, notes = $6, updated_at = NOW()
        WHERE id = $7 RETURNING *`,
        [contact.name, contact.email, contact.phone || null, contact.company || null, contact.category, contact.notes || null, contact.id]
      );
      return NextResponse.json({ contact: data });
    }

    // create
    const data = await execute(
      `INSERT INTO email_contacts (name, email, phone, company, category, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [contact.name, contact.email, contact.phone || null, contact.company || null, contact.category || 'other', contact.notes || null]
    );
    return NextResponse.json({ contact: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
