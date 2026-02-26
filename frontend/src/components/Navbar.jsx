import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, BarChart3, GitCompare, AlertTriangle, Lightbulb, Star, Menu, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/',           label: 'Home',          icon: Brain },
  { to: '/data',       label: 'Dataset',        icon: BarChart3 },
  { to: '/comparison', label: 'Models',         icon: GitCompare },
  { to: '/errors',     label: 'Errors',         icon: AlertTriangle },
  { to: '/lime',       label: 'Explanations',   icon: Lightbulb },
  { to: '/features',   label: 'Features',       icon: Star },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <motion.nav initial={{ y:-80, opacity:0 }} animate={{ y:0, opacity:1 }}
      transition={{ duration:0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-coral to-accent-amber flex items-center justify-center shadow-md">
              <Brain size={17} className="text-white" />
            </div>
            <span className="font-display text-base font-bold text-warm-800 hidden sm:block">
              Sentiment<span className="text-accent-coral">AI</span>
            </span>
          </NavLink>

          <div className="hidden lg:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `nav-link flex items-center gap-1.5 ${isActive ? 'active' : ''}`}>
                <Icon size={14} />{label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-sage/10 border border-accent-sage/20">
            <div className="w-2 h-2 rounded-full bg-accent-sage animate-pulse" />
            <span className="text-xs font-display font-semibold text-accent-sage">Static Mode</span>
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden text-warm-500">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
          className="lg:hidden border-t border-warm-200 px-4 py-3 flex flex-col gap-1 bg-white">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to==='/'} onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link flex items-center gap-2 ${isActive ? 'active' : ''}`}>
              <Icon size={14} />{label}
            </NavLink>
          ))}
        </motion.div>
      )}
    </motion.nav>
  )
}
