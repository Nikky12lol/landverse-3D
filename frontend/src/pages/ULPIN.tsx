import { useEffect, useState } from 'react';
import { Hash, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import type { UlpinRecord } from '../types';

export default function ULPIN() {
  const [list, setList] = useState<UlpinRecord[]>([]);
  const [form, setForm] = useState({ country: 'IND', state: 'TG', city: 'HYD', parcel: '01928', building: 1, floor: 4, unit: 1 });
  const [result, setResult] = useState<any>(null);
  const [check, setCheck] = useState('');
  const [checkOut, setCheckOut] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = () => api.ulpins().then(setList).catch(() => setMsg('Backend unreachable'));
  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setMsg('');
    try {
      const r = await api.generateUlpin(form);
      setResult(r);
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Generation failed');
    }
  };

  const validate = async () => {
    try {
      setCheckOut(await api.validateUlpin(check));
    } catch {
      setCheckOut({ valid: false, error: 'Request failed' });
    }
  };

  const num = (k: 'building' | 'floor' | 'unit') => ({
    value: form[k],
    onChange: (e: any) => setForm({ ...form, [k]: Number(e.target.value) }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Hash className="w-7 h-7 text-cyan-300" /> ULPIN Registry</h1>
      {msg && <div className="glass rounded-xl p-3 text-sm text-cyan-200">{msg}</div>}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3">Generate ULPIN</div>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {(['country', 'state', 'city', 'parcel'] as const).map((k) => (
              <label key={k} className="space-y-1">
                <div className="text-xs text-gray-400 uppercase">{k}</div>
                <input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-300/60" />
              </label>
            ))}
            {(['building', 'floor', 'unit'] as const).map((k) => (
              <label key={k} className="space-y-1">
                <div className="text-xs text-gray-400 uppercase">{k}</div>
                <input type="number" min={1} max={99} {...num(k)} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
              </label>
            ))}
          </div>
          <button onClick={generate} className="mt-3 w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold">Generate & register</button>
          <div className="mt-3 text-sm text-gray-400">Preview: <span className="text-cyan-200 font-mono">{form.country.toUpperCase()}-{form.state.toUpperCase()}-{form.city.toUpperCase()}-{String(form.parcel).padStart(4, '0')}-B{String(form.building).padStart(2, '0')}-F{String(form.floor).padStart(2, '0')}-U{String(form.unit).padStart(2, '0')}</span></div>
          {result && (
            <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-300/30 p-3 text-sm">
              <div className="font-mono text-emerald-200 text-base">{result.ulpin_code}</div>
              <div className="text-xs text-gray-400">{result.existing ? 'Already registered — returned existing record.' : 'Registered successfully.'}</div>
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Validate ULPIN</div>
          <div className="flex gap-2">
            <input value={check} onChange={(e) => setCheck(e.target.value)} placeholder="IND-TG-HYD-01928-B01-F04-U01" className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none font-mono text-sm" />
            <button onClick={validate} className="px-4 py-2 rounded-xl glass hover:border-cyan-300/50 text-sm">Check</button>
          </div>
          {checkOut && (
            <div className={`mt-3 rounded-xl p-3 text-sm border ${checkOut.valid ? 'bg-emerald-500/10 border-emerald-300/30' : 'bg-red-500/10 border-red-300/30'}`}>
              {checkOut.valid ? (
                <div>
                  <div className="text-emerald-300 font-semibold">Valid ULPIN</div>
                  <pre className="text-xs mt-1 text-gray-300">{JSON.stringify(checkOut.parts, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-red-300">{checkOut.error}</div>
              )}
            </div>
          )}
          <div className="mt-4 text-xs uppercase tracking-widest text-gray-400">Registered ({list.length})</div>
          <div className="mt-2 max-h-64 overflow-auto space-y-1.5">
            {list.map((r) => (
              <div key={r.id} className="font-mono text-xs bg-black/40 border border-white/10 rounded-lg px-2.5 py-2 flex justify-between">
                <span className="text-cyan-100">{r.ulpin_code}</span>
                <span className="text-gray-500">#{r.id}</span>
              </div>
            ))}
            {list.length === 0 && <div className="text-sm text-gray-500">None yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
