import { createClient } from "@/utils/supabase/client";

async function check() {
  const supabase = createClient();
  const r1 = await supabase.from("profiles").select("role").single();
  console.log(r1.data?.role);
}
