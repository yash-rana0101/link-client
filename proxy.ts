import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);
const PROTECTED_PREFIXES = [
  "/feed",
  "/profile",
  "/connections",
  "/verification",
  "/messaging",
  "/jobs",
  "/notifications",
];

const isProtectedPath = (pathname: string) =>
  pathname === "/" ||
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("zt_session")?.value === "1";

  if (PUBLIC_ROUTES.has(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  if (isProtectedPath(pathname) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
