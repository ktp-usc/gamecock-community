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

  return <AdminPageClient initialAuthenticated={initialAuthenticated} />;
}
