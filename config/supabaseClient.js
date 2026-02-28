import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load env here directly

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("SUPABASE_URL or SUPABASE_KEY not set in environment");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;