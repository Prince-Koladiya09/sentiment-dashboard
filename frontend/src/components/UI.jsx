import { motion } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={28} className="text-accent-coral animate-spin" />
      <p className="text-warm-400 text-sm font-display">{text}</p>
    </div>
  )
}

export function ErrorBanner({ message }) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border-2 border-dashed border-accent-amber/40 bg-accent-amber/5 text-center">
      <div className="text-4xl">🏋️</div>
      <div>
        <p className="text-base font-display font-bold text-warm-800 mb-1">No training data yet</p>
        <p className="text-sm text-warm-500 mb-4">Run training first to populate this page with real model results.</p>
        <div className="inline-block text-left bg-warm-900 text-green-400 rounded-xl px-5 py-3 font-mono text-sm">
          <span className="text-warm-500">$ </span>python train_and_export.py
        </div>
      </div>
      {message && <p className="text-xs text-warm-400 mt-1">{message}</p>}
    </div>
  )
}

export function StatCard({ value, label, icon: Icon, color = 'coral', delay = 0, sub }) {
  const colorMap = {
    purple: { text: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)' },
    cyan:   { text: '#5b8fb9', bg: 'rgba(91,143,185,0.08)', border: 'rgba(91,143,185,0.15)' },
    green:  { text: '#81b29a', bg: 'rgba(129,178,154,0.08)', border: 'rgba(129,178,154,0.15)' },
    amber:  { text: '#e6a54a', bg: 'rgba(230,165,74,0.08)', border: 'rgba(230,165,74,0.15)' },
    coral:  { text: '#e07a5f', bg: 'rgba(224,122,95,0.08)', border: 'rgba(224,122,95,0.15)' },
  }
  const c = colorMap[color] || colorMap.coral
  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.5, delay }}
      whileHover={{ y:-4, transition:{ duration:0.2 } }}
      className="card p-6 cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <Icon size={20} style={{ color: c.text }} />
        </div>
      </div>
      <div className="text-3xl font-display font-bold mb-1" style={{ color: c.text }}>{value}</div>
      <div className="section-label">{label}</div>
      {sub && <div className="text-xs text-warm-400 mt-1">{sub}</div>}
    </motion.div>
  )
}

export function SectionHeader({ icon: Icon, gradient, title, subtitle }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${gradient}`}>
          <Icon size={18} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-warm-800">{title}</h1>
      </div>
      {subtitle && <p className="text-warm-500 ml-[52px]">{subtitle}</p>}
    </motion.div>
  )
}

export function Badge({ label, color }) {
  const colors = {
    positive: { bg:'rgba(129,178,154,0.12)', text:'#4a8c6f', border:'rgba(129,178,154,0.25)' },
    negative: { bg:'rgba(224,92,140,0.12)',  text:'#c04070', border:'rgba(224,92,140,0.25)' },
    amber:    { bg:'rgba(230,165,74,0.12)',   text:'#b07d20', border:'rgba(230,165,74,0.25)' },
  }
  const c = colors[color] || colors.amber
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-display font-bold"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {label}
    </span>
  )
}
