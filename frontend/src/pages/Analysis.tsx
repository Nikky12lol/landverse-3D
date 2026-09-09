import { useEffect, useState } from 'react';
import { Cpu, Upload, Play, Building2 } from 'lucide-react';
import { api } from '../api/client';
import { API_BASE_URL } from '../config';
import type { Building } from '../types';

export default function Analysis() {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [parcelId, setParcelId] = useState<string>('');
  const [parcels, setParcels] = useState<any[]>([]);
  const [makeBuilding, setMakeBuilding] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    api.jobs().then(setJobs).catch(() => {});
    api.buildings().then(setBuildings).catch(() => {});
    api.parcels().then(setParcels).catch(() => {});
  };
  useEffect(() => {
    load();
  }, []);

  const doUpload = async () => {
    if (!file) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await api.upload(file);
      setUploaded(r);
      setMsg(`Uploaded ${r.original_name} (${(r.size / 1024).toFixed(1)} KB)`);
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const run = async () => {
    if (!uploaded) {
      setMsg('Upload an image first');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const r = await api.runAnalysis({
        filename: uploaded.filename,
        original_name: uploaded.original_name,
        create_building: makeBuilding,
        parcel_id: parcelId ? Number(parcelId) : null,
      });
      setResult(r);
      setMsg(`Detected ${r.building_type} · ${r.confidence}% confidence`);
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || 'Analysis failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Cpu className="w-7 h-7 text-cyan-300" /> AI Footprint Analysis</h1>
      {msg && <div className="glass rounded-xl p-3 text-sm text-cyan-200">{msg}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="font-semibold">1 · Upload nadir / drone image</div>
          <label className="block border-2 border-dashed border-cyan-300/30 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-300/60">
            <Upload className="w-8 h-8 mx-auto text-cyan-300 mb-2" />
            <div className="text-sm">{file ? file.name : 'Click to choose JPG / PNG / TIF / WebP (≤10 MB)'}</div>
            <input type="file" accept=".jpg,.jpeg,.png,.tif,.tiff,.webp,.bmp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button disabled={!file || busy} onClick={doUpload} className="w-full py-2.5 rounded-xl bg-cyan-400 text-black font-semibold disabled:opacity-40">
            {busy ? 'Working…' : 'Upload'}
          </button>

          <div className="font-semibold pt-2">2 · Run detection</div>
          <div className="flex gap-2 text-sm">
            <select value={parcelId} onChange={(e) => setParcelId(e.target.value)} className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none">
              <option value="">No parcel link</option>
              {parcels.map((p: any) => (
                <option key={p.id} value={p.id}>{p.parcel_number} · {p.location}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs glass px-3 rounded-xl">
              <input type="checkbox" checked={makeBuilding} onChange={(e) => setMakeBuilding(e.target.checked)} /> auto-create building
            </label>
          </div>
          <button disabled={!uploaded || busy} onClick={run} className="w-full py-2.5 rounded-xl glass border border-cyan-300/40 hover:bg-cyan-500/15 font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
            <Play className="w-4 h-4" /> {busy ? 'Analyzing…' : 'Run AI analysis'}
          </button>
          <div className="text-xs text-gray-500">Pipeline: grayscale → blur → Canny → contour → polygon → height/floor estimate. Deterministic, no mock data.</div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3">Result</div>
          {!result ? (
            <div className="text-sm text-gray-500">No run yet. Upload + analyze to see the detected footprint, overlay and building proposal.</div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Type', result.building_type],
                  ['Confidence', `${result.confidence}%`],
                  ['Height', `${result.estimated_height} m`],
                  ['Floors', result.estimated_floors],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-black/40 border border-white/10 p-3">
                    <div className="text-xs text-gray-400 uppercase">{k}</div>
                    <div className="text-lg font-bold text-cyan-200">{String(v)}</div>
                  </div>
                ))}
              </div>
              {result.annotated_url && (
                <img src={`${API_BASE_URL}${result.annotated_url}`} alt="annotated" className="rounded-xl border border-cyan-300/30 w-full" />
              )}
              <details className="rounded-xl bg-black/40 border border-white/10 p-3">
                <summary className="cursor-pointer text-xs text-gray-300">Footprint polygon ({(result.footprint || []).length} pts, normalized 0–1)</summary>
                <pre className="text-[11px] mt-2 text-cyan-100 overflow-auto max-h-40">{JSON.stringify(result.footprint, null, 1)}</pre>
              </details>
              {result.created_building && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-300/30 p-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-300" />
                  Created building <b>{result.created_building.building_code}</b> (id {result.created_building.id}) — see it in the 3D Map.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="font-semibold mb-2">Job history ({jobs.length}) · Buildings ({buildings.length})</div>
        <div className="grid md:grid-cols-4 gap-2 text-sm">
          {jobs.slice(0, 8).map((j: any) => (
            <div key={j.id} className="rounded-xl bg-black/40 border border-white/10 p-3">
              <div className="text-xs text-gray-500">#{j.id}</div>
              <div className="truncate">{j.file_name}</div>
              <div className="text-xs text-cyan-300">{j.building_type} · {j.confidence}% · {j.height} m · {j.floors} fl</div>
            </div>
          ))}
          {jobs.length === 0 && <div className="text-gray-500 text-sm">No jobs yet.</div>}
        </div>
      </div>
    </div>
  );
}
