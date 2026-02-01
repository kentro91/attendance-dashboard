import { supabase } from "../lib/supabaseClient";

export async function requireAuthOrRedirect(routerPush: (path: string) => void) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    routerPush("/login");
    return null;
  }
  return data.session;
}
