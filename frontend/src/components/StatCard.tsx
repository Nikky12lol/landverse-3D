import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="glass rounded-2xl p-5 card-hover"
    >
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30">
          <Icon className="w-5 h-5 text-cyan-300" />
        </span>
        <div>
          <div className="text-xs uppercase tracking-widest text-gray-400">{label}</div>
          <div className="text-2xl font-bold text-white">{value}</div>
        </div>
      </div>
      {sub && <div className="mt-2 text-xs text-gray-400">{sub}</div>}
    </motion.div>
  );
}
