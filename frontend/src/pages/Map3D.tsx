import { useEffect, useMemo, useState } from 'react';
import { MousePointerClick, Layers, Eye, EyeOff, Boxes } from 'lucide-react';
import CityScene from '../components/3d/CityScene';
import { api } from '../api/client';
import type { Building, Hierarchy, InfraItem, Parcel } from '../types';

export default function Map3D() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [infra, setInfra] = useState<InfraItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hierarchy, setHierarchy] = useState<Hierarchy | null>(null);
  const [showInfra, setShowInfra] = useState(true);
  const [exploded, setExploded] = useState(0);
  const [filter, setFilter] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    Promise.all([api.buildings(), api.parcels(), api.infra()])
      .then(([b, p, i]) => {
        setBuildings(b);
        setParcels(p);
        setInfra(i);
        setErr('');
      })
      .catch(() => setErr('Backend unreachable — start uvicorn on :8000'));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedId || selectedId === -1) {
      setHierarchy(null);
      if (selectedId === -1) setSelectedId(null);
      return;
    }
    api.hierarchy(selectedId).then(setHierarchy).catch(() => setHierarchy(null));
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return buildings;
    return buildings.filter(
      (b) =>
        b.building_code.toLowerCase().includes(q) ||
        (b.building_type || '').toLowerCase().includes(q)
    );
  }, [buildings, filter]);

  const selected = buildings.find((b) => b.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Boxes className="w-7 h-7 text-cyan-300" /> 3D City Twin
        </h1>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter towers…"
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm w-48 outline-none focus:border-cyan-300/60"
          />
          <label className="flex items-center gap-2 text-xs glass px-3 py-2 rounded-xl">
            <Layers className="w-3.5 h-3.5 text-cyan-300" /> Explode
            <input type="range" min={0} max={100} value={exploded * 100} onChange={(e) => setExploded(Number(e.target.value) / 100)} className="w-24" />
          </label>
          <button onClick={() => setShowInfra(!showInfra)} className="flex items-center gap-1.5 text-xs glass px-3 py-2 rounded-xl hover:border-cyan-300/50">
            {showInfra ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />} Underground
          </button>
          <button onClick={load} className="text-xs px-3 py-2 rounded-xl bg-cyan-400 text-black font-semibold">Refresh</button>
        </div>
      </div>

      {err && <div className="glass rounded-xl p-4 text-red-300 text-sm">{err}</div>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CityScene
            buildings={filtered}
            parcels={parcels}
            infra={infra}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showInfra={showInfra}
            exploded={exploded}
            drillHierarchy={hierarchy}
            height={560}
          />
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
            <MousePointerClick className="w-3.5 h-3.5" /> Drag to orbit · scroll to zoom · click a tower for Parcel → Building → Floor → Unit drill-down
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-4 max-h-64 overflow-auto">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Buildings ({filtered.length})</div>
            <div className="space-y-1.5">
              {filtered.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm border transition-colors ${
                    selectedId === b.id ? 'border-cyan-300/60 bg-cyan-500/15' : 'border-white/10 bg-black/30 hover:border-cyan-300/40'
                  }`}
                >
                  <div className="font-semibold">{b.building_code}</div>
                  <div className="text-xs text-gray-400">{b.building_type} · {b.height} m · {b.floors} fl · AI {b.ai_confidence}%</div>
                </button>
              ))}
              {filtered.length === 0 && <div className="text-sm text-gray-500">No matches.</div>}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Drill-down</div>
            {!selected ? (
              <div className="text-sm text-gray-500">Select a tower to inspect its full hierarchy.</div>
            ) : !hierarchy ? (
              <div className="text-sm text-gray-500">Loading hierarchy…</div>
            ) : (
              <div className="text-sm space-y-2">
                <div className="rounded-xl bg-black/40 p-3 border border-white/10">
                  <div className="text-xs text-gray-400">PARCEL</div>
                  <div className="font-semibold">{hierarchy.parcel?.parcel_number || '—'} · {hierarchy.parcel?.location}</div>
                  <div className="text-xs text-gray-400">{hierarchy.parcel?.area} sq.m</div>
                </div>
                <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-300/30">
                  <div className="text-xs text-cyan-200">BUILDING</div>
                  <div className="font-semibold">{hierarchy.building.building_code} · {hierarchy.building.height} m</div>
                  <div className="text-xs text-gray-300">{hierarchy.building.building_type} · {hierarchy.building.floors} floors · AI {hierarchy.building.ai_confidence}%</div>
                </div>
                <div className="max-h-56 overflow-auto space-y-1.5">
                  {hierarchy.floors.map((f) => (
                    <details key={f.id} className="rounded-xl bg-black/40 border border-white/10 px-3 py-2">
                      <summary className="cursor-pointer text-sm">Floor {f.floor_number} · {(f.units || []).length} units</summary>
                      <div className="mt-2 space-y-1">
                        {(f.units || []).length === 0 && <div className="text-xs text-gray-500">No units registered.</div>}
                        {(f.units || []).map((u) => (
                          <div key={u.id} className="text-xs flex justify-between bg-white/5 rounded-lg px-2 py-1">
                            <span>Unit {u.unit_number} · {u.property_type}</span>
                            <span className="text-gray-400">{u.area} sq.ft · {u.owner_status}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
