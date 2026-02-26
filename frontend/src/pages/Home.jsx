import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Brain, BarChart3, Target, Zap, ArrowRight, ChevronRight, Database, TrendingUp } from 'lucide-react'
import { StatCard } from '../components/UI'
import { useData } from '../hooks/useData'
import { getMetrics } from '../services/api'
import { MODEL_COLORS, MODEL_ORDER } from '../constants'

const PIPELINE = [
  { icon:'📝', label:'Raw IMDB Text',   desc:'50K movie reviews' },
  { icon:'🧹', label:'Preprocess',      desc:'HTML strip · lemmatize · stopwords' },
  { icon:'🔢', label:'Vectorize',       desc:'TF-IDF · Sequences · BERT tokens' },
  { icon:'🧠', label:'Train Models',    desc:'NB · LR · BiLSTM · DistilBERT' },
  { icon:'📊', label:'Evaluate',        desc:'Metrics · ROC · Confusion matrix' },
  { icon:'📤', label:'Export JSON',     desc:'Static dashboard reads results' },
]

const TECH = [
  { name:'scikit-learn', icon:'⚙️', color:'#e07a5f' },
  { name:'TensorFlow',   icon:'🧠', color:'#FF6F00' },
  { name:'DistilBERT',   icon:'🤗', color:'#e6a54a' },
  { name:'LIME',         icon:'🔍', color:'#8b5cf6' },
  { name:'FastAPI',      icon:'⚡', color:'#81b29a' },
  { name:'React',        icon:'⚛️', color:'#5b8fb9' },
  { name:'Recharts',     icon:'📊', color:'#5b8fb9' },
  { name:'NLTK',         icon:'📚', color:'#81b29a' },
]

export default function Home() {
  const nav = useNavigate()
  const { data: metrics } = useData(getMetrics)

  const bestModel  = metrics ? Object.entries(metrics).sort((a,b) => b[1]['F1-Score'] - a[1]['F1-Score'])[0] : null
  const bestAcc    = bestModel ? `${(bestModel[1]['Accuracy']*100).toFixed(1)}%` : '...'
  const bestF1     = bestModel ? bestModel[1]['F1-Score'].toFixed(3) : '...'
  const bestAUC    = bestModel ? bestModel[1]['AUC-ROC'].toFixed(3) : '...'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center mb-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background:'radial-gradient(circle,#e07a5f,transparent 70%)' }} />
        <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
          transition={{ duration:0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 text-xs font-display font-semibold"
          style={{ background:'rgba(224,122,95,0.1)', border:'1px solid rgba(224,122,95,0.2)', color:'#e07a5f' }}>
          <span className="w-2 h-2 rounded-full bg-accent-sage animate-pulse" />
          Static ML Dashboard · IMDB · 4 Models · Real Training Results
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="text-5xl sm:text-7xl font-display font-extrabold leading-tight mb-6 text-warm-800">
          Movie<br />
          <span className="bg-gradient-to-r from-accent-coral to-accent-amber bg-clip-text text-transparent">Sentiment</span><br />
          Analysis
        </motion.h1>

        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="text-warm-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          End-to-end NLP pipeline trained on 50,000 IMDB reviews. All metrics, charts, and
          explanations are generated from <strong>real model training</strong> — no mock data.
        </motion.p>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={() => nav('/comparison')}
            className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
            View Model Results <TrendingUp size={16} />
          </button>
          <button onClick={() => nav('/errors')}
            className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
            Explore Errors <ArrowRight size={16} />
          </button>
        </motion.div>
      </motion.div>

      {/* Stats from real training */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        <StatCard value={bestAcc}   label="Best Accuracy"    icon={Target}   color="coral"  delay={0}   sub={bestModel?.[0]} />
        <StatCard value={bestF1}    label="Best F1 Score"    icon={Brain}    color="cyan"   delay={0.1} sub="DistilBERT" />
        <StatCard value={bestAUC}   label="Best AUC-ROC"     icon={Zap}      color="green"  delay={0.2} />
        <StatCard value="4"         label="Models Compared"  icon={Database} color="amber"  delay={0.3} sub="NB · LR · LSTM · BERT" />
      </div>

      {/* Model Performance Summary */}
      {metrics && (
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="card p-6 mb-16">
          <p className="section-label mb-4">Model Performance Overview</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MODEL_ORDER.filter(m => metrics[m]).map(name => {
              const m = metrics[name]
              const color = MODEL_COLORS[name]
              return (
                <div key={name} className="p-4 rounded-xl" style={{ background:`${color}0D`, border:`1px solid ${color}25` }}>
                  <div className="font-display font-bold text-sm mb-3" style={{ color }}>{name}</div>
                  {['Accuracy','F1-Score','AUC-ROC'].map(k => (
                    <div key={k} className="flex justify-between text-xs mb-1.5">
                      <span className="text-warm-400">{k}</span>
                      <span className="font-display font-semibold" style={{ color }}>
                        {(m[k]*100).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-warm-100 text-xs text-warm-400">
                    {m.Inference_ms?.toFixed(1)}ms / sample
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Pipeline */}
      <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="mb-16">
        <h2 className="text-2xl font-display font-bold text-warm-800 mb-1">Pipeline Flow</h2>
        <p className="text-warm-500 text-sm mb-8">From raw text to static dashboard</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="card p-4 text-center w-full hover:scale-[1.03] transition-transform">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-display text-xs font-bold text-warm-800 mb-1">{s.label}</div>
                <div className="text-xs text-warm-400 leading-tight">{s.desc}</div>
              </div>
              {i < PIPELINE.length-1 && (
                <div className="hidden lg:block"><ChevronRight size={16} className="text-accent-coral opacity-40 mt-2 -mr-3" /></div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
        <h2 className="text-2xl font-display font-bold text-warm-800 mb-1">Tech Stack</h2>
        <p className="text-warm-500 text-sm mb-8">Everything powering this dashboard</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {TECH.map((t, i) => (
            <motion.div key={i} whileHover={{ scale:1.08, y:-4 }}
              className="card p-3.5 text-center cursor-default">
              <div className="text-2xl mb-1.5">{t.icon}</div>
              <div className="text-xs font-display font-semibold" style={{ color:t.color }}>{t.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
