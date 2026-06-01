// Proxy only checks for a minimal auth indicator cookie.
// Full auth is handled client-side via AuthProvider.
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // The client sets this cookie after successful login
  const hasSession = request.cookies.has("skillplan-session");

  if (!hasSession && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/skill/:path*", "/import"],
};
