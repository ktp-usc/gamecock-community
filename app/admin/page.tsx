import { cookies } from "next/headers";

import AdminPageClient from "@/app/admin/admin-page-client";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSession,
} from "@/lib/server/admin-auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const initialAuthenticated = isValidAdminSession(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );
  const adminEmail = process.env.ADMIN_EMAIL ?? "";

  return (
    <AdminPageClient
      adminEmail={adminEmail}
      initialAuthenticated={initialAuthenticated}
    />
  );
}
