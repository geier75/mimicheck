import React, { useState } from 'react';

export default function KinderSection({ profil, handleChange, setProfil }) {
  const kinder = profil.kinder || [];

  const addKind = () => {
    setProfil(prev => ({
      ...prev,
      kinder: [...(prev.kinder || []), { id: Date.now(), vorname: '', geburtsdatum: '', in_ausbildung: false }]
    }));
  };

  const updateKind = (id, field, value) => {
    setProfil(prev => ({
      ...prev,
      kinder: prev.kinder.map(k => k.id === id ? { ...k, [field]: value } : k)
    }));
  };

  const removeKind = (id) => {
    setProfil(prev => ({
      ...prev,
      kinder: prev.kinder.filter(k => k.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
        <div className="flex items-start gap-3">
          <span className="text-xl">👶</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-pink-300 mb-1">Kinder & Kindergeld</h4>
            <p className="text-xs text-white/60">
              Angaben zu Kindern für Kindergeld, Kinderzuschlag und Familienkasse (§ 32 EStG, BKGG).
            </p>
          </div>
        </div>
      </div>

      {/* ANZAHL KINDER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-sm">👨‍👩‍👧</span>
            Ihre Kinder ({kinder.length})
          </h4>
          <button 
            onClick={addKind}
            className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-lg text-sm font-medium hover:bg-pink-500/30"
          >
            + Kind hinzufügen
          </button>
        </div>

        {kinder.length === 0 && (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-4xl mb-4 block">👶</span>
            <p className="text-white/60">Noch keine Kinder eingetragen</p>
            <button 
              onClick={addKind}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-medium"
            >
              Erstes Kind hinzufügen
            </button>
          </div>
        )}

        {kinder.map((kind, index) => (
          <div key={kind.id} className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-semibold text-white">Kind {index + 1}</h5>
              <button 
                onClick={() => removeKind(kind.id)}
                className="text-rose-400 hover:text-rose-300 text-sm"
              >
                ✕ Entfernen
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Vorname</label>
                <input 
                  type="text"
                  value={kind.vorname || ''}
                  onChange={(e) => updateKind(kind.id, 'vorname', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Geburtsdatum</label>
                <input 
                  type="date"
                  value={kind.geburtsdatum || ''}
                  onChange={(e) => updateKind(kind.id, 'geburtsdatum', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-300/80 mb-1.5">Steuer-ID</label>
                <input 
                  type="text"
                  value={kind.steuer_id || ''}
                  onChange={(e) => updateKind(kind.id, 'steuer_id', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm"
                  placeholder="11-stellig"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={kind.in_ausbildung || false}
                  onChange={(e) => updateKind(kind.id, 'in_ausbildung', e.target.checked)}
                />
                <span className="text-sm text-white/70">In Ausbildung/Studium</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={kind.kindergeld_bezug || false}
                  onChange={(e) => updateKind(kind.id, 'kindergeld_bezug', e.target.checked)}
                />
                <span className="text-sm text-white/70">Kindergeld wird bezogen</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* KINDERGELD INFO */}
      <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <h4 className="text-sm font-semibold text-emerald-300 mb-3">Kindergeld 2024</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-2xl font-bold text-emerald-400">250€</p>
            <p className="text-xs text-white/60">pro Kind/Monat</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold text-white/80">bis 18 Jahre</p>
            <p className="text-xs text-white/60">Grundanspruch</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold text-white/80">bis 25 Jahre</p>
            <p className="text-xs text-white/60">bei Ausbildung</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-lg font-bold text-white/80">unbegrenzt</p>
            <p className="text-xs text-white/60">bei Behinderung</p>
          </div>
        </div>
      </div>

      {/* KINDERZUSCHLAG */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Kinderzuschlag (KiZ)</p>
            <p className="text-xs text-amber-200/70">
              Bis zu 292€ zusätzlich pro Kind für Familien mit geringem Einkommen.
              Wird nach Eingabe aller Daten automatisch geprüft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
