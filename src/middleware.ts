import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  const token = getSessionCookie(request); // returns cookie string or undefined

  const { pathname } = request.nextUrl;
  const isAuth = !!token;
  const isLoginPage = [
    "/login",
    "/signup",
    "/forget-password",
    "/reset-password",
  ].includes(pathname);

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const protectedRoutes = [
    "/",
    "/books",
    "/emails",
    "/quotation",
  ];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isAuth && isProtected && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api|fonts|manifest.json|robots.txt).*)",
  ],
};
