import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

type SupabaseCookieStore = Awaited<ReturnType<typeof cookies>> & {
    set(
        name: string,
        value: string,
        options?: {
            path?: string;
            domain?: string;
            maxAge?: number;
            expires?: Date;
            httpOnly?: boolean;
            secure?: boolean;
            sameSite?: "lax" | "strict" | "none";
        }
    ): void;
};

export async function createSupabaseServerClient() {
    const cookieStore = (await cookies()) as SupabaseCookieStore;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        throw new Error("Missing Supabase server environment variables.");
    }

    return createServerClient<Database>(url, anonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                } catch {
                    // Server Components can read cookies but cannot always mutate them.
                }
            },
        },
    });
}
