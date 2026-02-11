import { edgeAuth } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

export default edgeAuth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/customize") || pathname.startsWith("/templates");

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/customize/:path*", "/templates/:path*"],
};