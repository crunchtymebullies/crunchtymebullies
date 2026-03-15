import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query(
      `SELECT id, email, display_name, color, initials FROM email_accounts WHERE active = true ORDER BY is_default DESC, email`
    );
    return NextResponse.json(rows);
  } catch {
    // Return default account if table doesn't exist yet
    return NextResponse.json([
      { email: 'info@crunchtymebullies.com', display_name: 'Crunchtime Bullies', color: '#D4A84C', initials: 'CB' }
    ]);
  }
}
