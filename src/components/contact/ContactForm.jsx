import React, { useState } from 'react';
import { submitContact } from '@/api/contact';

export default function ContactForm() {
  const [full_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(null);
  const [err, setErr] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErr(null);
    try {
      const res = await submitContact({ full_name, email, message });
      setOk(true);
      // Optional: res.data[0] enthält die erstellte Row
      setName(''); setEmail(''); setMsg('');
    } catch (e) {
      setErr(e.message || 'Fehler beim Senden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm mb-1">Vollständiger Name</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={full_name}
          onChange={e => setName(e.target.value)}
          placeholder="Max Mustermann"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">E-Mail</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="max@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Nachricht</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-28"
          value={message}
          onChange={e => setMsg(e.target.value)}
          placeholder="Wie können wir helfen?"
          required
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md border px-4 py-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Senden…' : 'Absenden'}
      </button>

      {ok && <p className="text-green-600">Gesendet. Danke!</p>}
      {err && <p className="text-red-600">Fehler: {err}</p>}
    </form>
  );
}
