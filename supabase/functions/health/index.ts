import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ALLOWED = [
  "http://localhost:8500",
  "https://mimicheck.ai",
  "https://www.mimicheck.ai",
];

serve((req) => {
  const origin = req.headers.get("origin") ?? "";
  const allow = ALLOWED.includes(origin) ? origin : ALLOWED[0];

  return new Response(
    JSON.stringify({ ok: true, ts: new Date().toISOString() }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allow,
      },
    },
  );
});
