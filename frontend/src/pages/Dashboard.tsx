import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Layers, Hash, Activity, Gauge, Ruler } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import { api } from '../api/client';
import type { DashboardStats } from '../types';

const COLORS = ['#22d3ee', '#f0abfc', '#6ee7b7', '#facc15', '#c4b5fd', '#fda4af'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.stats().then(setStats).catch(() => setErr('Backend unreachable — start FastAPI on :8000'));
  }, []);

  if (err) return <div className="glass rounded-2xl p-8 text-center text-red-300">{err}</div>;
  if (!stats) return <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading live stats…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Command Dashboard</h1>
          <p className="text-sm text-gray-400">Live from FastAPI · SQLite/Postgres · auto-seeded demo city</p>
        </div>
        <Link to="/map" className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-sm font-semibold">Open 3D Map</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard icon={Layers} label="Parcels" value={stats.parcels} />
        <StatCard icon={Building2} label="Buildings" value={stats.buildings} delay={0.05} />
        <StatCard icon={Hash} label="ULPINs" value={stats.ulpins} delay={0.1} />
        <StatCard icon={Activity} label="Infra assets" value={stats.infrastructure} delay={0.15} />
        <StatCard icon={Gauge} label="Avg AI conf" value={`${stats.avg_confidence}%`} delay={0.2} />
        <StatCard icon={Ruler} label="Avg height" value={`${stats.avg_height} m`} sub={`${stats.total_area.toLocaleString()} sq.m tracked`} delay={0.25} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3">Buildings by type</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={stats.by_type}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={0} angle={-14} height={60} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0b0f1a', border: '1px solid #22d3ee55', borderRadius: 10 }} />
                <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="font-semibold mb-3">Validation status mix</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.by_status} dataKey="value" nameKey="name" outerRadius={95} label>
                  {stats.by_status.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0b0f1a', border: '1px solid #22d3ee55', borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="font-semibold mb-3">Recent AI jobs</div>
        {stats.recent_jobs.length === 0 ? (
          <div className="text-sm text-gray-400">No jobs yet — <Link className="text-cyan-300 underline" to="/analysis">run your first analysis</Link>.</div>
        ) : (
          <div className="grid md:grid-cols-5 gap-3">
            {stats.recent_jobs.map((j) => (
              <div key={j.id} className="rounded-xl bg-black/40 border border-white/10 p-3 text-sm">
                <div className="text-gray-400 text-xs">#{j.id}</div>
                <div className="truncate">{j.file_name}</div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-0.5 rounded-full ${j.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{j.status}</span>
                </div>
                {j.confidence != null && <div className="text-cyan-300 text-xs mt-1">{j.confidence}% conf</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
