import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000/landing';
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <section className="mx-auto max-w-6xl p-8 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            MiMiCheck – Dein digitaler Antragshelfer
          </h1>
          <p className="mt-4 text-slate-600">
            Lade Abrechnungen hoch, finde Förderungen und lass KI Anträge für dich ausfüllen.
          </p>
          <div className="mt-8 flex gap-3">
            <a 
              href={`${landingUrl}#auth`}
              className="px-5 py-3 rounded-lg bg-black text-white inline-block"
            >
              Anmelden / Registrieren
            </a>
            <Link to="/Contact" className="px-5 py-3 rounded-lg border">Kontakt</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            DSGVO-konform · RLS-gesichert · Edge-Functions
          </p>
        </div>
        <div className="rounded-2xl h-72 md:h-96 bg-slate-900/90 text-white flex items-center justify-center">
          <span className="opacity-60">Interactive 3D / Hero Canvas</span>
        </div>
      </section>
    </main>
  );
}
