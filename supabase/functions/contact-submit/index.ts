// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Zod Schema: strikte Validierung
const BodySchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(2000),
});

// Soft Rate Limit (in-memory, pro Edge-Instanz)
const WINDOW_MS = 60_000; // 1 Minute
const MAX_REQ = 5;
const hits = new Map<string, { count: number; ts: number }>();

function allow(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }
  if (rec.count < MAX_REQ) {
    rec.count++;
    return true;
  }
  return false;
}

// CORS Allowlist
const ALLOWED_ORIGINS = new Set([
  "http://localhost:8005",
  "http://localhost:8500",
  "https://mimicheck.ai",
  "https://www.mimicheck.ai",
]);

function corsHeaders(origin: string) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "http://localhost:8005";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  } as Record<string, string>;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "*";
  const headers = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Soft Rate Limit
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    "unknown";
  if (!allow(String(ip))) {
    return new Response(JSON.stringify({ ok: false, error: "Rate limit exceeded" }), {
      status: 429,
      headers,
    });
  }

  // JSON-Parsing + Validierung
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(", ");
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 400,
      headers,
    });
  }

  // Service-Role Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://yjjauvmjyhlxcoumwqlj.supabase.co";
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY");
  if (!serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "SERVICE_ROLE_KEY not configured" }),
      { status: 500, headers },
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await admin
    .from("contact_requests")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers,
    });
  }

  return new Response(JSON.stringify({ ok: true, data: [data] }), {
    status: 201,
    headers,
  });
});
