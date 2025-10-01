import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'gm_admin'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Chỉ bảo vệ /admin (trừ trang /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const isAdmin = req.cookies.get(ADMIN_COOKIE)?.value === '1'
    if (!isAdmin) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('next', pathname) // để login xong quay lại
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
