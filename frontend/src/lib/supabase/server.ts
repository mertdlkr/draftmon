import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";
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
    return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
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
