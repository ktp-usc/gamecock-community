import { NextResponse } from "next/server";

import { createAdminSessionCookie } from "@/lib/server/admin-auth";
import { jsonError, readJson } from "@/lib/route-helpers";

type AdminLoginInput = {
  password?: string;
};

export async function POST(request: Request) {
  const input = await readJson<AdminLoginInput>(request);

  if (!input || typeof input.password !== "string") {
    return jsonError("Password is required.");
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return jsonError("Admin password is not configured.", 500);
  }

  if (input.password !== adminPassword) {
    return jsonError("Incorrect password.", 401);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(createAdminSessionCookie());
  return response;
}
