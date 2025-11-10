import { useRef, useState, useCallback } from 'react';
import { submitContact } from '@/api/contact';

function debounce(fn, wait = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function ContactForm() {
  const [full_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMsg] = useState('');
  const [hp, setHp] = useState(''); // Honeypot
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const lastSubmitTs = useRef(0);
  const COOLDOWN_MS = 3000;

  const handleSubmitCore = async (e) => {
    e?.preventDefault?.();
    if (loading) return;

    const now = Date.now();
    if (now - lastSubmitTs.current < COOLDOWN_MS) {
      setFeedback({ ok: false, msg: 'Bitte kurz warten…' });
      return;
    }

    // Honeypot: wenn Bots es ausfüllen → Client-seitig abbrechen
    if (hp && hp.trim().length > 0) {
      setFeedback({ ok: false, msg: 'Fehlerhafte Eingabe.' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    try {
      const res = await submitContact({ full_name, email, message, hp });
      setFeedback({ ok: true, msg: 'Gesendet. Danke!' });
      // optional Felder leeren
      setName(''); setEmail(''); setMsg(''); setHp('');
      lastSubmitTs.current = now;
    } catch (err) {
      setFeedback({ ok: false, msg: err?.message || 'Senden fehlgeschlagen' });
    } finally {
      setLoading(false);
    }
  };

  // leichte Entschärfung von Enter-Spam
  const handleSubmit = useCallback(debounce(handleSubmitCore, 300), [full_name, email, message, hp, loading]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot – sichtbar für Bots, unsichtbar für Menschen */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-5000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        <label>
          Bitte NICHT ausfüllen:
          <input
            type="text"
            name="hp"
            autoComplete="off"
            tabIndex={-1}
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="w-full border rounded p-2"
          value={full_name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={80}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">E-Mail</label>
        <input
          type="email"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Nachricht</label>
        <textarea
          className="w-full border rounded p-2"
          value={message}
          onChange={(e) => setMsg(e.target.value)}
          minLength={5}
          maxLength={2000}
          required
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={loading}
        onClick={handleSubmit} // schützt auch Button-Spam
      >
        {loading ? 'Senden…' : 'Senden'}
      </button>

      {feedback && (
        <p className={feedback.ok ? 'text-green-600' : 'text-red-600'}>
          {feedback.msg}
        </p>
      )}
    </form>
  );
}
