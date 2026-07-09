import { NextRequest, NextResponse } from "next/server";

// Simple password protection middleware
// Set DEMO_PASSWORD env var in Vercel to enable
export function middleware(req: NextRequest) {
  const password = process.env.DEMO_PASSWORD;
  if (!password) return NextResponse.next(); // No password set — open access

  // Skip password check for API routes (needed for login)
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for demo password cookie
  const cookie = req.cookies.get("demo_access");
  if (cookie?.value === password) {
    return NextResponse.next();
  }

  // Allow access to the password page itself
  if (req.nextUrl.pathname === "/demo-login") {
    return NextResponse.next();
  }

  // Check for password in query params (for form submission)
  const queryPassword = req.nextUrl.searchParams.get("password");
  if (queryPassword === password) {
    const res = NextResponse.redirect(new URL(req.nextUrl.pathname, req.url));
    res.cookies.set("demo_access", password, { maxAge: 60 * 60 * 24, httpOnly: true, sameSite: "lax" });
    return res;
  }

  // Redirect to password page
  return NextResponse.redirect(new URL("/demo-login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};