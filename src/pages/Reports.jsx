import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Reports(){
  const { id } = useParams();
  const [state, setState] = React.useState({ loading: true, data: null, err: null });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // TODO: echte Datenquelle anbinden
        // const res = await fetch(`/api/reports/${id}`);
        // if (!res.ok) throw new Error('not found');
        if (!cancelled) setState({ loading: false, data: { id }, err: null });
      } catch(e){
        if (!cancelled) setState({ loading: false, data: null, err: e.message });
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (state.loading) return <div className="p-6">Lade Bericht…</div>;
  if (state.err) return (
    <div className="p-6">
      <p className="text-red-600">Bericht nicht gefunden.</p>
      <Link to="/Abrechnungen" className="underline">Zurück zu Abrechnungen</Link>
    </div>
  );
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Bericht #{state.data.id}</h1>
      {/* TODO: Inhalt */}
    </div>
  );
}
