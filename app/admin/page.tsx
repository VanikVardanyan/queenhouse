import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/login-form";
import { AdminDashboard } from "@/components/admin/dashboard";
import { ADMIN_EMAIL } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return <LoginForm />;
  }

  return <AdminDashboard email={user.email} />;
}
