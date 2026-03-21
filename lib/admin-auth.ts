import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.COOKIE_SECRET || 'crunchtyme-admin-fallback-secret'
  return new TextEncoder().encode(secret)
}

/**
 * Verify admin auth from request headers.
 * Accepts either:
 *   - x-admin-password header (legacy, plain password)
 *   - Authorization: Bearer <jwt> header (new, token-based)
 * Returns null if authorized, or a 401 NextResponse if not.
 */
export async function verifyAdmin(req: NextRequest): Promise<NextResponse | null> {
  // Check Bearer token first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      await jwtVerify(token, getSecret())
      return null // authorized
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }
  }

  // Fallback to password check
  const password = req.headers.get('x-admin-password')
  if (password && password === process.env.ADMIN_PASSWORD) {
    return null // authorized
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
