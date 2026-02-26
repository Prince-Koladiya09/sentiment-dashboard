import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { useData } from '../hooks/useData'
import { getLimeExamples } from '../services/api'
import { LoadingSpinner, ErrorBanner, SectionHeader, Badge } from '../components/UI'
import { MODEL_COLORS, MODEL_ORDER } from '../constants'

function WordBar({ word, weight }) {
  const isPos = weight > 0
  const pct   = Math.min(Math.abs(weight) * 300, 100)
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-display font-semibold w-24 text-right text-warm-700 truncate">{word}</span>
      <div className="flex-1 flex items-center gap-1 h-5">
        <div className="flex-1 relative h-3 rounded-full overflow-hidden bg-warm-100">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute h-full rounded-full"
            style={{ background: isPos ? '#81b29a' : '#e05c8c',
                     left: isPos ? '50%' : undefined, right: isPos ? undefined : '50%',
                     transform: isPos ? 'none' : 'none' }}
          />
        </div>
        <span className="text-[10px] font-display w-12 text-right" style={{ color: isPos ? '#4a8c6f' : '#c04070' }}>
          {weight > 0 ? '+' : ''}{weight.toFixed(3)}
        </span>
      </div>
    </div>
  )
}

function LimeCard({ example, idx }) {
  const color = MODEL_COLORS[example.model] || '#e07a5f'
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.06 }}
      className="card p-5">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <span className="font-display text-xs font-bold px-2 py-1 rounded-lg"
            style={{ background:`${color}15`, color }}>
            {example.model}
          </span>
          <span className="ml-2 text-[10px] font-display font-semibold px-2 py-0.5 rounded-full"
            style={{ background: example.correct ? 'rgba(129,178,154,0.15)' : 'rgba(224,92,140,0.12)',
                     color: example.correct ? '#4a8c6f' : '#c04070' }}>
            {example.correct ? '✓ Correct' : '✗ Wrong'}
          </span>
        </div>
        <span className="font-display text-xs font-bold" style={{ color }}>
          {(example.confidence*100).toFixed(1)}%
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <Badge label={`True: ${example.true_label}`}  color={example.true_label} />
        <Badge label={`Pred: ${example.pred_label}`}  color={example.correct ? example.pred_label : 'amber'} />
      </div>

      <p className="text-xs text-warm-600 italic line-clamp-2 mb-4 leading-relaxed">
        "{example.text}"
      </p>

      <p className="section-label mb-2">Top contributing words</p>
      <div>
        {example.words?.map((w, i) => (
          <WordBar key={i} word={w.word} weight={w.weight} />
        ))}
      </div>
      <p className="text-[10px] text-warm-400 mt-3">Green = pushes toward positive · Red = pushes toward negative</p>
    </motion.div>
  )
}

export default function LimeExplorer() {
  const { data, loading, error } = useData(getLimeExamples)
  const [modelFilter, setModelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12"><LoadingSpinner text="Loading LIME explanations..." /></div>

  if (error || !data || data.length === 0) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <SectionHeader icon={Lightbulb} gradient="bg-gradient-to-br from-accent-amber to-accent-coral"
        title="LIME Explanations" subtitle="Pre-computed local interpretable model explanations" />
      <ErrorBanner message={error || "No LIME data available. Install 'lime' and run train_and_export.py"} />
      <div className="mt-8 card p-6">
        <p className="section-label mb-3">About LIME</p>
        <p className="text-sm text-warm-600 leading-relaxed mb-4">
          LIME (Local Interpretable Model-agnostic Explanations) explains individual predictions by perturbing the
          input and observing how predictions change. For text, it removes words and sees which ones most affect the model's confidence.
        </p>
        <p className="text-sm text-warm-600 leading-relaxed">
          This page shows 24 pre-computed explanations: 8 easy positives, 8 easy negatives, and 8 hard cases
          where the model was wrong. You can compare how different models explain the same review.
        </p>
      </div>
    </div>
  )

  const models = MODEL_ORDER.filter(m => data.some(e => e.model === m))
  const filtered = data.filter(e =>
    (modelFilter === 'all' || e.model === modelFilter) &&
    (statusFilter === 'all' || (statusFilter === 'correct' ? e.correct : !e.correct))
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={Lightbulb} gradient="bg-gradient-to-br from-accent-amber to-accent-coral"
        title="LIME Explanations"
        subtitle={`${data.length} pre-computed explanations — see exactly which words drive each prediction`} />

      <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
        <span className="section-label">Filter:</span>
        <div className="flex gap-1">
          {['all', ...models].map(m => (
            <button key={m} onClick={() => setModelFilter(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all capitalize"
              style={{
                background: modelFilter===m ? `${MODEL_COLORS[m] || '#e07a5f'}15` : 'transparent',
                color: modelFilter===m ? (MODEL_COLORS[m] || '#e07a5f') : '#9a8b78',
                border: `1px solid ${modelFilter===m ? `${MODEL_COLORS[m] || '#e07a5f'}30` : 'transparent'}`
              }}>
              {m === 'all' ? 'All Models' : m}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          {[['all','All'],['correct','Correct'],['wrong','Wrong']].map(([val,label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-all"
              style={{
                background: statusFilter===val ? 'rgba(224,122,95,0.1)' : 'transparent',
                color: statusFilter===val ? '#e07a5f' : '#9a8b78'
              }}>
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-warm-400">{filtered.length} explanations</span>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-warm-400">No explanations match the current filters.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((ex, i) => <LimeCard key={i} example={ex} idx={i} />)}
        </div>
      )}
    </div>
  )
}
