import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Plus } from 'lucide-react';
import CityScene from '../components/3d/CityScene';
import { api } from '../api/client';
import type { Building, InfraItem, Parcel } from '../types';

export default function Infrastructure() {
  const [items, setItems] = useState<InfraItem[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [form, setForm] = useState({ infrastructure_id: '', type: 'Water Pipeline', depth: 6, owner: 'Municipal Authority' });
  const [foundation, setFoundation] = useState(8);
  const [tolerance, setTolerance] = useState(3);
  const [conflicts, setConflicts] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    api.infra().then(setItems).catch(() => setMsg('Backend unreachable'));
    api.buildings().then(setBuildings).catch(() => {});
    api.parcels().then(setParcels).catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setMsg('');
    try {
      await api.createInfra({ ...form, status: 'active' });
      setForm({ ...form, infrastructure_id: '' });
      setMsg('Asset registered');
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Create failed');
    }
  };

  const check = async () => {
    try {
      setConflicts(await api.checkConflict({ foundation_depth: foundation, tolerance }));
    } catch {
      setMsg('Conflict check failed');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Activity className="w-7 h-7 text-cyan-300" /> Underground Infrastructure</h1>
      {msg && <div className="glass rounded-xl p-3 text-sm text-cyan-200">{msg}</div>}

      <CityScene buildings={buildings} parcels={parcels} infra={items} showInfra exploded={0} height={420} />

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3 flex items-center gap-1.5"><Plus className="w-4 h-4" /> Register asset ({items.length})</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <input value={form.infrastructure_id} onChange={(e) => setForm({ ...form, infrastructure_id: e.target.value })} placeholder="INF-0300" className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none">
              {['Water Pipeline', 'Sewer', 'Electric Cable', 'Metro Tunnel', 'Fiber Cable', 'Gas Line', 'Storm Drain'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input type="number" step="0.1" value={form.depth} onChange={(e) => setForm({ ...form, depth: Number(e.target.value) })} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
          </div>
          <button onClick={create} className="mt-3 w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold">Register</button>
          <div className="mt-3 space-y-1.5 max-h-56 overflow-auto">
            {items.map((i) => (
              <div key={i.id} className="text-sm flex justify-between bg-black/40 border border-white/10 rounded-lg px-2.5 py-2">
                <span><b>{i.infrastructure_id}</b> · {i.type}</span>
                <span className="text-cyan-300">{i.depth} m · {i.owner}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-yellow-300" /> Foundation conflict check</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="space-y-1">
              <div className="text-xs text-gray-400">Foundation depth (m)</div>
              <input type="number" step="0.5" value={foundation} onChange={(e) => setFoundation(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
            </label>
            <label className="space-y-1">
              <div className="text-xs text-gray-400">Tolerance (m)</div>
              <input type="number" step="0.5" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
            </label>
          </div>
          <button onClick={check} className="mt-3 w-full py-2.5 rounded-xl glass border border-yellow-300/40 hover:bg-yellow-500/10 font-semibold">Check conflicts</button>
          {conflicts && (
            <div className="mt-3 text-sm">
              <div className={`rounded-xl p-3 border ${conflicts.conflict_count ? 'bg-red-500/10 border-red-300/30 text-red-200' : 'bg-emerald-500/10 border-emerald-300/30 text-emerald-200'}`}>
                {conflicts.conflict_count ? `${conflicts.conflict_count} conflict(s) at ${conflicts.foundation_depth} m foundation` : `Clear at ${conflicts.foundation_depth} m — no assets within ±${conflicts.tolerance} m`}
              </div>
              <div className="mt-2 space-y-1.5">
                {(conflicts.conflicts || []).map((c: any) => (
                  <div key={c.id} className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-2 flex justify-between">
                    <span>{c.infrastructure_id} · {c.type} @ {c.depth} m</span>
                    <span className={c.severity === 'high' ? 'text-red-300' : 'text-yellow-300'}>gap {c.depth_gap} m · {c.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
