
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function toDashboard(request: NextRequest) {
  try {
  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export function middleware(req: NextRequest) {
  try {
    let destination = req.nextUrl.pathname;
    if (destination.includes('/dashboard')) {
      return toDashboard(req);
    }
  } catch (error) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next(); // Permite continuar si todo está bien
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/about/:path*',
}