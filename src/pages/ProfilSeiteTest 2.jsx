import React from 'react';

const ProfilSeiteTest = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">ProfilSeite Test</h1>
        <p className="text-white/60">Wenn du das siehst, funktioniert die Route!</p>
        <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <p className="text-cyan-300">✅ Rendering erfolgreich!</p>
          <p className="text-white/40 text-sm mt-2">URL: /profilseite</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilSeiteTest;
