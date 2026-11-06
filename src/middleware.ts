import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "truskill-dev-jwt-secret-key-change-in-production"
);

const PUBLIC_PATHS = ["/login", "/api/seed"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internal next requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("truskill_session")?.value;

  let sessionUser = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      sessionUser = payload as { id: string; email: string; name: string; role: string };
    } catch {
      sessionUser = null;
    }
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated user to login
  if (!sessionUser && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated user away from login to dashboard
  if (sessionUser && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Restrict /master-data to SUPERADMIN only
  if (pathname.startsWith("/master-data") && sessionUser?.role !== "SUPERADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
