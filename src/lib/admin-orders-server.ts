import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export function getSecuraWebConfig():
  | { baseUrl: string; token: string }
  | { error: string; status: number } {
  const baseUrl = process.env.SECURA_WEB_BASE_URL?.replace(/\/+$/, "");
  const token = process.env.SECURA_INTERNAL_API_TOKEN?.trim();

  if (!baseUrl || !token) {
    return { error: "Secura web integration is not configured", status: 500 };
  }

  return { baseUrl, token };
}

export async function requireAdminApiAccess(
  request: NextRequest,
): Promise<{ ok: true } | { error: string; status: number }> {
  const token = request.cookies.get("sb-access-token")?.value;
  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return { error: "Supabase auth is not configured", status: 500 };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { error: "Unauthorized", status: 401 };
  }

  return { ok: true };
}

export async function proxySecuraWeb(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const config = getSecuraWebConfig();
  if ("error" in config) {
    return Response.json({ error: config.error }, { status: config.status });
  }

  return fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      "x-secura-internal-token": config.token,
    },
  });
}
