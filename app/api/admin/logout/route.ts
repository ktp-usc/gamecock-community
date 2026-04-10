import { NextResponse } from "next/server";

import { clearAdminSessionCookie } from "@/lib/server/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearAdminSessionCookie());
  return response;
}
