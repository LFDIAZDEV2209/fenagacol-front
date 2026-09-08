import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para Client Components / browser.
 * Usa anon key (publicable). No usar service_role aquí.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan env NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — copia .env.example a .env.local"
    );
  }

  return createBrowserClient(url, anonKey);
}
