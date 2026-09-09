import { useEffect, useState } from 'react';
import { ShieldCheck, Play } from 'lucide-react';
import { api } from '../api/client';
import type { Building } from '../types';

export default function Validation() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sel, setSel] = useState<string>('');
  const [out, setOut] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.buildings().then((b) => {
      setBuildings(b);
      if (b.length && !sel) setSel(String(b[0].id));
    }).catch(() => setMsg('Backend unreachable'));
    api.validations().then(setHistory).catch(() => {});
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async () => {
    if (!sel) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await api.runValidation(Number(sel));
      setOut(r);
      api.validations().then(setHistory).catch(() => {});
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Validation failed');
    } finally {
      setBusy(false);
    }
  };

  const badge = (s: string) =>
    s === 'valid'
      ? 'bg-emerald-500/20 text-emerald-300'
      : s === 'review'
        ? 'bg-yellow-500/20 text-yellow-300'
        : 'bg-red-500/20 text-red-300';

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-cyan-300" /> Property Validation</h1>
      {msg && <div className="glass rounded-xl p-3 text-sm text-cyan-200">{msg}</div>}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="font-semibold">Run rule checks</div>
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 outline-none text-sm">
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.building_code} · {b.building_type} · {b.height} m / {b.floors} fl · AI {b.ai_confidence}%</option>
            ))}
          </select>
          <button onClick={run} disabled={busy || !sel} className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            <Play className="w-4 h-4" /> {busy ? 'Checking…' : 'Run validation'}
          </button>
          <div className="text-xs text-gray-500">Checks: height↔floor ratio (2.8–4.2 m/fl), AI confidence bands, parcel area present, type classified, floor/height sanity.</div>
          {out && (
            <div className="rounded-2xl bg-black/40 border border-white/10 p-4 text-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-black text-cyan-200">{out.score}</div>
                <span className={`px-3 py-1 rounded-full text-xs ${badge(out.status)}`}>{out.status.toUpperCase()}</span>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-400">Checks</div>
                <pre className="text-xs bg-black/50 rounded-xl p-3 mt-1 overflow-auto text-gray-300">{JSON.stringify(out.checks, null, 2)}</pre>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-400">Warnings ({out.warnings.length})</div>
                {out.warnings.length === 0 ? (
                  <div className="text-emerald-300 text-sm mt-1">Clean — no warnings.</div>
                ) : (
                  <ul className="list-disc ml-5 mt-1 text-yellow-200 text-sm space-y-1">
                    {out.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-2">History ({history.length})</div>
          <div className="space-y-2 max-h-[520px] overflow-auto">
            {history.map((h: any) => (
              <div key={h.id} className="rounded-xl bg-black/40 border border-white/10 p-3 text-sm flex items-center gap-3">
                <div className="text-2xl font-bold text-cyan-200 w-14">{h.score}</div>
                <div className="flex-1">
                  <div>Building #{h.property_id}</div>
                  <div className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()} · {(h.warnings || []).length} warnings</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs ${badge(h.status)}`}>{h.status}</span>
              </div>
            ))}
            {history.length === 0 && <div className="text-sm text-gray-500">No validations yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
