import { Link, NavLink, Outlet } from 'react-router-dom';
import { Boxes, LayoutDashboard, Map, Layers, Cpu, ShieldCheck, Hash, Activity } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map', label: '3D Map', icon: Map },
  { to: '/parcels', label: 'Parcels', icon: Layers },
  { to: '/analysis', label: 'AI Analysis', icon: Cpu },
  { to: '/ulpin', label: 'ULPIN', icon: Hash },
  { to: '/validation', label: 'Validation', icon: ShieldCheck },
  { to: '/infrastructure', label: 'Underground', icon: Activity },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-cyber-dark text-white">
      <nav className="sticky top-0 z-50 glass border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-wide">
            <span className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-400/40">
              <Boxes className="w-5 h-5 text-cyan-300" />
            </span>
            <span>
              LANDVERSE <span className="text-cyan-300 neon-text">3D</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 flex-wrap">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40' : 'text-gray-300 hover:text-cyan-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            API :8000 · UI :5173
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="max-w-7xl mx-auto px-4 pb-8 text-xs text-gray-500">
        LANDVERSE 3D · AI-Powered 3D Property Intelligence · FastAPI + React Three Fiber
      </footer>
    </div>
  );
}
