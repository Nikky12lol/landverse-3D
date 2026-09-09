import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, Cpu, Hash, Map, ShieldCheck, Layers, ArrowRight, Sparkles } from 'lucide-react';

const feats = [
  { icon: Map, title: 'Dynamic 3D City', desc: 'Procedural buildings extruded from real footprints. Click any tower to drill Parcel → Building → Floor → Unit.' },
  { icon: Cpu, title: 'AI Footprint Detection', desc: 'Upload drone / satellite imagery. OpenCV extracts the footprint polygon, height, floors and type.' },
  { icon: Hash, title: 'ULPIN Registry', desc: 'Generate and validate IND-STATE-CITY-PARCEL-B-F-U property IDs with one click.' },
  { icon: ShieldCheck, title: 'Rule Validation', desc: 'Height/floor consistency, AI confidence and sanity checks produce a 0–100 score.' },
  { icon: Layers, title: 'Underground View', desc: 'Water, sewer, power, metro and fibre assets rendered below the city with conflict checks.' },
  { icon: Sparkles, title: 'Live Dashboard', desc: 'Counts, type mix, confidence trends and recent AI jobs stream from FastAPI.' },
];

export default function Landing() {
  return (
    <div className="space-y-12">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-10">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full glass text-cyan-200 mb-5">
          <Boxes className="w-3.5 h-3.5" /> AI-POWERED 3D PROPERTY INTELLIGENCE
        </div>
        <h1 className="text-5xl md:text-6xl font-black leading-tight">
          LANDVERSE <span className="text-cyan-300 neon-text">3D</span>
        </h1>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
          From parcels to rooftops to underground utilities — one living 3D twin of your city.
          Detect buildings with AI, assign ULPINs, validate records and explore everything in real time.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link to="/map" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300">
            Open 3D Map <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/dashboard" className="px-6 py-3 rounded-xl glass hover:border-cyan-300/50">
            Dashboard
          </Link>
          <Link to="/analysis" className="px-6 py-3 rounded-xl glass hover:border-cyan-300/50">
            Try AI Analysis
          </Link>
        </div>
        <div className="mt-6 text-xs text-gray-500">Backend :8000 · Frontend :5173 · SQLite out-of-the-box, Postgres ready</div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {feats.map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
            className="glass rounded-2xl p-5 card-hover"
          >
            <span className="inline-block p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 mb-3">
              <Icon className="w-5 h-5 text-cyan-300" />
            </span>
            <div className="font-semibold mb-1">{title}</div>
            <div className="text-sm text-gray-400">{desc}</div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 text-sm text-gray-300">
        <div className="font-semibold text-white mb-2">Quick start</div>
        <pre className="text-xs bg-black/50 rounded-xl p-4 overflow-x-auto text-cyan-100">
{`# terminal 1 — backend
cd backend
python -m venv venv
venv\\Scripts\\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000/docs

# terminal 2 — frontend
cd frontend
npm install
npm run dev                     # http://localhost:5173`}
        </pre>
      </div>
    </div>
  );
}
