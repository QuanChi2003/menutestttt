import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'gm_admin'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { username, password } = body || {}

  const u = process.env.ADMIN_USER || 'admin'
  const p = process.env.ADMIN_PASS || 'admin'

  if (username !== u || password !== p) {
    return new NextResponse('Sai tài khoản hoặc mật khẩu', { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  // Cookie sống 7 ngày, httpOnly để an toàn hơn
  res.cookies.set(ADMIN_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
