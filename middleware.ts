import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // allow localhost
  if (url.hostname === "localhost") {
    return NextResponse.next();
  }

  // force everything to .com
  if (url.hostname !== "internkhojo.com") {
    const newUrl = new URL(url.toString());
    newUrl.hostname = "internkhojo.com";
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}
