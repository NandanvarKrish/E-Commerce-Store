import { createClient } from "@/utils/supabase/client";

async function check() {
  const supabase = createClient();
  const res = await supabase.from("profiles").select("*").single();
  // Hover or check res.data
  type DataType = typeof res.data;
  const x: DataType = null as any;
  console.log(x);
}
