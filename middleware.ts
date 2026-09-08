import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (pathname.startsWith("/dashboard")) {
    const email = await verifySession(token);
    if (!email) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    const email = await verifySession(token);
    if (email) {
      const url = request.nextUrl.clone();
      const next = url.searchParams.get("next");
      url.pathname = next && next.startsWith("/dashboard") ? next : "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
