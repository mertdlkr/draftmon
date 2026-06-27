import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

export function createSupabaseAdminClient() {
    return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
