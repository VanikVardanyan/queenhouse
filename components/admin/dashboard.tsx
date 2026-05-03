"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HouseTabs } from "./house-tabs";
import { BookingCalendar } from "./booking-calendar";
import type { House } from "@/lib/supabase/types";

export function AdminDashboard({ email }: { email: string }) {
  const [house, setHouse] = useState<House>("small");

  async function signOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="font-display text-2xl">Queen House Admin</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{email}</span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-border px-3 py-1.5 hover:bg-muted"
          >
            Выйти
          </button>
        </div>
      </header>
      <div className="mt-6 flex flex-col gap-6">
        <HouseTabs value={house} onChange={setHouse} />
        <BookingCalendar house={house} />
      </div>
    </div>
  );
}
