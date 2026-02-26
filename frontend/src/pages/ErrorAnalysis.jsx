import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { useData } from '../hooks/useData'
import { getErrors, getConfidenceDist } from '../services/api'
import { LoadingSpinner, ErrorBanner, SectionHeader, Badge } from '../components/UI'
import { TOOLTIP_STYLE, AXIS_STYLE, MODEL_COLORS, MODEL_ORDER } from '../constants'

export default function ErrorAnalysis() {
  const { data: errors,   loading: le, error: ee } = useData(getErrors)
  const { data: confDist, loading: lc }             = useData(getConfidenceDist)

  const [modelFilter, setModelFilter]   = useState('all')
  const [typeFilter,  setTypeFilter]    = useState('all')
  const [minConf,     setMinConf]       = useState(0)
  const [page,        setPage]          = useState(0)
  const PER = 10

  if (le) return <div className="max-w-6xl mx-auto px-4 py-12"><LoadingSpinner text="Loading error analysis..." /></div>
  if (ee) return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorBanner message={ee} /></div>

  const allErrors = errors || []
  const models    = MODEL_ORDER.filter(m => allErrors.some(e => e.model === m))

  const filtered = allErrors.filter(e =>
    (modelFilter === 'all' || e.model === modelFilter) &&
    (typeFilter  === 'all' || e.error_type === typeFilter) &&
    e.confidence >= minConf
  )
  const paged = filtered.slice(page*PER, (page+1)*PER)
  const pages = Math.ceil(filtered.length / PER)

  // Errors per model bar chart
  const errPerModel = models.map(m => ({
    model: m.split(' ')[0], fullName: m,
    count: allErrors.filter(e => e.model === m).length,
    fp: allErrors.filter(e => e.model === m && e.error_type === 'False Positive').length,
    fn: allErrors.filter(e => e.model === m && e.error_type === 'False Negative').length,
  }))

  // High confidence failures
  const topBad = [...allErrors].sort((a,b) => b.confidence - a.confidence).slice(0,4)

  // Error by length bucket
  const lenBuckets = [{lo:0,hi:200},{lo:200,hi:500},{lo:500,hi:800},{lo:800,hi:1200},{lo:1200,hi:99999}]
  const lenData = lenBuckets.map(({lo,hi}) => {
    const bucket = allErrors.filter(e => e.length >= lo && e.length < hi)
    return {
      bucket: hi===99999 ? `${lo}+` : `${lo}-${hi}`,
      errors: bucket.length,
      avgConf: bucket.length ? +(bucket.reduce((s,e)=>s+e.confidence,0)/bucket.length).toFixed(3) : 0
    }
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={AlertTriangle} gradient="bg-gradient-to-br from-accent-rose to-accent-amber"
        title="Error Analysis"
        subtitle={`${allErrors.length} real misclassifications from test set — showing where and why models fail`} />

      {/* Summary charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Errors per model */}
        <div className="card p-6">
          <p className="section-label mb-1">Errors per Model (top 60 shown)</p>
          <p className="text-xs text-warm-400 mb-4">False Positives vs False Negatives</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={errPerModel} margin={{ top:5, right:10, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
              <XAxis dataKey="model" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,name,{payload})=>[v, name==='fp'?'False Positive':'False Negative']} />
              <Bar dataKey="fp" name="False Positive" fill="#5b8fb9" fillOpacity={0.8} radius={[4,4,0,0]} stackId="a" />
              <Bar dataKey="fn" name="False Negative" fill="#e05c8c" fillOpacity={0.8} radius={[4,4,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Error by length */}
        <div className="card p-6">
          <p className="section-label mb-1">Errors by Review Length</p>
          <p className="text-xs text-warm-400 mb-4">Are shorter reviews harder to classify?</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lenData} margin={{ top:5, right:10, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
              <XAxis dataKey="bucket" tick={{ ...AXIS_STYLE, fontSize:10 }} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="errors" fill="#e05c8c" fillOpacity={0.75} radius={[6,6,0,0]} name="Error Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence Distribution */}
      {confDist && (
        <div className="card p-6 mb-8">
          <p className="section-label mb-1">Confidence Distribution</p>
          <p className="text-xs text-warm-400 mb-4">
            Green = correct predictions · Red = wrong predictions — ideal models have high confidence only on correct predictions
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MODEL_ORDER.filter(m => confDist[m]).map(model => (
              <div key={model}>
                <p className="text-xs font-display font-semibold mb-2" style={{ color: MODEL_COLORS[model] }}>{model}</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={confDist[model]} margin={{ top:0, right:5, bottom:15, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
                    <XAxis dataKey="bucket" tick={{ ...AXIS_STYLE, fontSize:8 }} angle={-30} textAnchor="end" />
                    <YAxis tick={{ ...AXIS_STYLE, fontSize:9 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="correct" name="Correct" fill="#81b29a" fillOpacity={0.8} radius={[3,3,0,0]} stackId="a" />
                    <Bar dataKey="wrong"   name="Wrong"   fill="#e05c8c" fillOpacity={0.8} radius={[3,3,0,0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High confidence failures */}
      <div className="card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={14} className="text-accent-rose" />
          <p className="section-label text-accent-rose">Highest Confidence Failures</p>
        </div>
        <p className="text-xs text-warm-400 mb-4">Model was very confident — but completely wrong</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topBad.map((e, i) => (
            <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}
              className="p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/15">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-xs font-bold text-accent-rose">{e.model}</span>
                <span className="font-display text-xs font-bold text-accent-rose">{(e.confidence*100).toFixed(1)}% WRONG</span>
              </div>
              <p className="text-xs text-warm-600 line-clamp-2 mb-2 italic">"{e.review}"</p>
              <div className="flex gap-2 text-xs">
                <Badge label={`True: ${e.true_label}`}  color={e.true_label} />
                <span className="text-warm-300">→ predicted</span>
                <Badge label={e.pred_label} color={e.pred_label} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filterable Error Table */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 flex-wrap">
          <p className="section-label">All Misclassifications</p>
          <div className="flex gap-2 flex-wrap">
            <select value={modelFilter} onChange={e=>{setModelFilter(e.target.value);setPage(0)}}
              className="text-xs font-display font-semibold bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none text-warm-700">
              <option value="all">All Models</option>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(0)}}
              className="text-xs font-display font-semibold bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none text-warm-700">
              <option value="all">All Types</option>
              <option value="False Positive">False Positives</option>
              <option value="False Negative">False Negatives</option>
            </select>
            <select value={minConf} onChange={e=>{setMinConf(parseFloat(e.target.value));setPage(0)}}
              className="text-xs font-display font-semibold bg-warm-50 border border-warm-200 rounded-xl px-3 py-2 focus:outline-none text-warm-700">
              <option value={0}>Any Confidence</option>
              <option value={0.7}>≥ 70%</option>
              <option value={0.8}>≥ 80%</option>
              <option value={0.9}>≥ 90%</option>
            </select>
          </div>
          <span className="text-xs text-warm-400">{filtered.length} results</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-warm-200">
                {['Model','Review','True Label','Predicted','Type','Confidence','Length'].map(h => (
                  <th key={h} className="text-left py-3 px-2 section-label whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((e, i) => (
                <tr key={i} className="border-b border-warm-100 hover:bg-warm-50">
                  <td className="py-3 px-2">
                    <span className="font-display font-semibold whitespace-nowrap" style={{ color:MODEL_COLORS[e.model] }}>
                      {e.model?.split(' ')[0]}
                    </span>
                  </td>
                  <td className="py-3 px-2 max-w-xs">
                    <span className="line-clamp-2 text-warm-600">"{e.review}"</span>
                  </td>
                  <td className="py-3 px-2"><Badge label={e.true_label} color={e.true_label} /></td>
                  <td className="py-3 px-2">
                    <span className="font-display font-semibold" style={{ color:'#e05c8c' }}>{e.pred_label} ✗</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-accent-amber/10 text-accent-amber border border-accent-amber/20 font-semibold">
                      {e.error_type?.replace('False ','')}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-display font-bold" style={{ color: e.confidence>0.85?'#e05c8c':'#e6a54a' }}>
                    {(e.confidence*100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-2 text-warm-400">{e.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-warm-100">
          <span className="text-xs text-warm-400">Showing {Math.min(paged.length, PER)} of {filtered.length}</span>
          <div className="flex gap-2 items-center">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold disabled:opacity-30 bg-warm-100 text-warm-600 hover:bg-warm-200">← Prev</button>
            <span className="text-xs font-display text-accent-coral font-semibold">{page+1} / {Math.max(1,pages)}</span>
            <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold disabled:opacity-30 bg-warm-100 text-warm-600 hover:bg-warm-200">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
