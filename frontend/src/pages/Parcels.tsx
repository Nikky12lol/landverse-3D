import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../api/client';
import type { Parcel } from '../types';

export default function Parcels() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [form, setForm] = useState({ parcel_number: '', location: 'Hyderabad, Telangana', latitude: 17.385, longitude: 78.4867, area: 2000 });
  const [msg, setMsg] = useState('');

  const load = () => api.parcels().then(setParcels).catch(() => setMsg('Backend unreachable'));
  useEffect(() => {
    load();
  }, []);

  const open = (id: number) => api.parcel(id).then(setDetail).catch(() => setMsg('Failed to load parcel'));

  const create = async () => {
    setMsg('');
    try {
      await api.createParcel(form);
      setForm({ ...form, parcel_number: '' });
      setMsg('Parcel created');
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Create failed');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Land Parcels</h1>
      {msg && <div className="glass rounded-xl p-3 text-sm text-cyan-200">{msg}</div>}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-widest">
                <th className="py-2">Parcel</th>
                <th>Location</th>
                <th>Area</th>
                <th>Buildings</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((p) => (
                <tr key={p.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="py-2 font-semibold">{p.parcel_number}</td>
                  <td className="text-gray-400">{p.location}</td>
                  <td>{p.area} sq.m</td>
                  <td>{p.building_count}</td>
                  <td>
                    <button onClick={() => open(p.id)} className="text-cyan-300 text-xs underline">Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <div className="font-semibold mb-2 flex items-center gap-1.5"><Plus className="w-4 h-4" /> New parcel</div>
            <div className="space-y-2 text-sm">
              <input value={form.parcel_number} onChange={(e) => setForm({ ...form, parcel_number: e.target.value })} placeholder="PRC-01933" className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-cyan-300/60" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" step="0.0001" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
                <input type="number" step="0.0001" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
                <input type="number" value={form.area} onChange={(e) => setForm({ ...form, area: Number(e.target.value) })} className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none" />
              </div>
              <button onClick={create} className="w-full py-2 rounded-xl bg-cyan-400 text-black font-semibold">Create parcel</button>
            </div>
          </div>
          {detail && (
            <div className="glass rounded-2xl p-4 text-sm">
              <div className="font-semibold text-lg">{detail.parcel_number}</div>
              <div className="text-gray-400">{detail.location} · {detail.area} sq.m</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-gray-400">Buildings</div>
              <div className="mt-1 space-y-1">
                {(detail.buildings || []).map((b: any) => (
                  <div key={b.id} className="flex justify-between bg-black/40 rounded-lg px-2 py-1.5 border border-white/10">
                    <span>{b.building_code} · {b.building_type}</span>
                    <span className="text-cyan-300">{b.height} m · {b.floors} fl</span>
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
