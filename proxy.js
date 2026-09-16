import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";

export function proxy(request) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/gatherings/:path*",
    "/mypage/:path*",
    "/notifications/:path*",
  ],
};
