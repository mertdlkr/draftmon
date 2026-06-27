function readEnv(...keys: string[]): string | undefined {
    for (const key of keys) {
        const value = process.env[key];
        if (value) return value;
    }
    return undefined;
}

export function getSupabaseUrl() {
    const url = readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
    if (!url) {
        throw new Error("Missing Supabase URL environment variable.");
    }
    return url;
}

export function getSupabaseAnonKey() {
    const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY");
    if (!anonKey) {
        throw new Error("Missing Supabase anon key environment variable.");
    }
    return anonKey;
}

export function getSupabaseServiceRoleKey() {
    const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceRoleKey) {
        throw new Error("Missing Supabase service role key environment variable.");
    }
    return serviceRoleKey;
}
