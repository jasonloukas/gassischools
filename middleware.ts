import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  const portalMatch = pathname.match(/^\/portal\/([^/]+)\/.+$/);
  if (portalMatch) {
    const token = portalMatch[1];
    const authorized =
      session?.role === "staff" ||
      (session?.role === "school" && session.token === token);
    if (!authorized) {
      return NextResponse.redirect(new URL(`/portal/${token}`, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/staff/") || pathname === "/staff") {
    if (session?.role !== "staff") {
      return NextResponse.redirect(new URL("/staff-login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:token/:path+", "/staff", "/staff/:path+"],
};
