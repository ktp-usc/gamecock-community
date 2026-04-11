import AdminPageClient from "@/app/admin/admin-page-client";
import { authServer } from "@/lib/auth/server";

export default async function AdminPage() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const { data: session } = await authServer.getSession();
  const initialAuthenticated =
    !!adminEmail &&
    session?.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  return (
    <AdminPageClient
      adminEmail={adminEmail}
      initialAuthenticated={initialAuthenticated}
    />
  );
}
