"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If logged in -> today, else -> login
    (async () => {
      const { data } = await supabase.auth.getSession();
      router.replace(data.session ? "/today" : "/login");
    })();
  }, [router]);

  return <p>Loading…</p>;
}
