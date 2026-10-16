import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/home", "/study", "/rooms", "/subjects", "/u", "/s", "/settings"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("pomo_session");
  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next|.*\..*).*)"] };
