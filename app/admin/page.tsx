import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/admin/login-form";
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

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="font-display text-3xl">Queen House Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
      <p className="mt-6 text-muted-foreground">Загрузка панели бронирований…</p>
    </div>
  );
}
