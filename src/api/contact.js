export async function submitContact({ full_name, email, message, hp }) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact-submit`;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ full_name, email, message, hp }),
  });

  let data = null;
  try {
    data = await r.json();
  } catch (_) {}

  if (!r.ok || !data?.ok) {
    const msg = data?.error || data?.message || `Request failed (${r.status})`;
    throw new Error(msg);
  }

  return data;
}
