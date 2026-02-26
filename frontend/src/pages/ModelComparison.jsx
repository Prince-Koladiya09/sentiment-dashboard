import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  Cell, ReferenceLine
} from 'recharts'
import { GitCompare, Star } from 'lucide-react'
import { useData } from '../hooks/useData'
import { getMetrics, getConfusionMatrices, getRocCurves, getPrCurves, getTrainingHistory, getModelAgreement } from '../services/api'
import { LoadingSpinner, ErrorBanner, SectionHeader, Badge } from '../components/UI'
import { TOOLTIP_STYLE, AXIS_STYLE, MODEL_COLORS, MODEL_ORDER } from '../constants'

const METRICS = ['Accuracy','Precision','Recall','F1-Score','AUC-ROC']

function ConfusionMatrix({ data, name }) {
  if (!data) return null
  const [[tn,fp],[fn,tp]] = data
  const total = tn+fp+fn+tp
  const cells = [
    { label:'True Neg',  v:tn, color:'#5b8fb9' },
    { label:'False Pos', v:fp, color:'#e05c8c' },
    { label:'False Neg', v:fn, color:'#e05c8c' },
    { label:'True Pos',  v:tp, color:'#81b29a' },
  ]
  return (
    <div>
      <p className="section-label mb-3">{name}</p>
      <div className="grid grid-cols-3 gap-1 max-w-52 mx-auto text-xs">
        <div/><div className="text-center text-warm-400 py-1 font-semibold">Pred −</div>
        <div className="text-center text-warm-400 py-1 font-semibold">Pred +</div>
        {['Act −','Act +'].map((row, ri) => [
          <div key={`r${ri}`} className="flex items-center justify-end pr-2 text-warm-400 font-semibold">{row}</div>,
          ...cells.slice(ri*2,(ri+1)*2).map((c, ci) => (
            <div key={`${ri}${ci}`} className="aspect-square flex flex-col items-center justify-center rounded-xl"
              style={{ background:`${c.color}15`, border:`1px solid ${c.color}30` }}>
              <span className="text-lg font-display font-bold" style={{ color:c.color }}>{c.v.toLocaleString()}</span>
              <span className="text-[9px] font-semibold mt-0.5" style={{ color:c.color, opacity:0.7 }}>{c.label}</span>
              <span className="text-[9px]" style={{ color:c.color, opacity:0.5 }}>{((c.v/total)*100).toFixed(1)}%</span>
            </div>
          ))
        ])}
      </div>
    </div>
  )
}

export default function ModelComparison() {
  const { data: metrics,  loading: lm, error: em } = useData(getMetrics)
  const { data: cms,      loading: lc }             = useData(getConfusionMatrices)
  const { data: roc,      loading: lr }             = useData(getRocCurves)
  const { data: pr,       loading: lp }             = useData(getPrCurves)
  const { data: history,  loading: lh }             = useData(getTrainingHistory)
  const { data: agreeRaw, loading: la }             = useData(getModelAgreement)

  const [selMetric, setSelMetric] = useState('F1-Score')

  if (lm) return <div className="max-w-6xl mx-auto px-4 py-12"><LoadingSpinner text="Loading model metrics..." /></div>
  if (em) return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorBanner message={em} /></div>

  const models = MODEL_ORDER.filter(m => metrics?.[m])

  // Table data
  const tableData = models.map((m, i) => ({ model: m, ...metrics[m], colorIdx: i }))

  // Bar chart data
  const barData = models.map(m => ({ model: m.split(' ')[0], fullName:m, value: metrics[m][selMetric]*100 }))

  // Radar data
  const radarData = METRICS.map(metric => {
    const pt = { metric }
    models.forEach(m => { pt[m] = metrics[m][metric]*100 })
    return pt
  })

  // Inference time comparison
  const inferData = models.map(m => ({
    model: m.split(' ')[0], fullName: m,
    ms: metrics[m].Inference_ms || 0
  }))

  // Model agreement matrix
  const agreeMatrix = agreeRaw?.matrix || {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={GitCompare} gradient="bg-gradient-to-br from-accent-plum to-accent-blue"
        title="Model Comparison" subtitle="Real metrics from training on IMDB test set" />

      {/* Metrics Table */}
      <div className="card p-6 mb-6">
        <p className="section-label mb-4">Performance Summary — Test Set Results</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200">
                <th className="text-left py-3 px-3 section-label">Model</th>
                {METRICS.map(k => <th key={k} className="text-center py-3 px-3 section-label">{k}</th>)}
                <th className="text-center py-3 px-3 section-label">Inference</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => {
                const color = MODEL_COLORS[row.model]
                const isTopAcc = models.every(m => metrics[m].Accuracy <= row.Accuracy)
                return (
                  <tr key={row.model} className="border-b border-warm-100 hover:bg-warm-50">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                        <span className="font-display font-semibold text-warm-700">{row.model}</span>
                        {isTopAcc && <Star size={12} className="text-accent-amber fill-accent-amber" />}
                      </div>
                    </td>
                    {METRICS.map(k => {
                      const isTop = models.every(m => metrics[m][k] <= row[k])
                      return (
                        <td key={k} className="py-3.5 px-3 text-center">
                          <span className="font-display font-semibold text-sm" style={{ color: isTop ? color : '#9a8b78' }}>
                            {(row[k]*100).toFixed(2)}%{isTop ? ' ★' : ''}
                          </span>
                        </td>
                      )
                    })}
                    <td className="py-3.5 px-3 text-center text-xs font-display text-warm-400">
                      {row.Inference_ms?.toFixed(2)}ms
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Metric Comparison</p>
            <div className="flex gap-1 flex-wrap">
              {METRICS.map(m => (
                <button key={m} onClick={() => setSelMetric(m)}
                  className="px-2 py-1 rounded-lg text-xs font-display font-semibold transition-all"
                  style={{ background: selMetric===m?'rgba(224,122,95,0.1)':'transparent',
                           color: selMetric===m?'#e07a5f':'#9a8b78',
                           border:`1px solid ${selMetric===m?'rgba(224,122,95,0.25)':'transparent'}` }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top:5, right:10, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
              <XAxis dataKey="model" tick={AXIS_STYLE} />
              <YAxis domain={[85,100]} tick={AXIS_STYLE} tickFormatter={v=>`${v.toFixed(0)}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,_,{payload})=>[`${v.toFixed(3)}%`, payload.fullName]} />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {barData.map((_, i) => <Cell key={i} fill={MODEL_COLORS[models[i]]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <p className="section-label mb-4">Radar Comparison</p>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ebe3d9" />
              <PolarAngleAxis dataKey="metric" tick={{ ...AXIS_STYLE, fontSize:10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>[`${v.toFixed(2)}%`]} />
              <Legend wrapperStyle={{ fontSize:11, fontFamily:'Inter' }} />
              {models.map(m => (
                <Radar key={m} name={m} dataKey={m} stroke={MODEL_COLORS[m]}
                  fill={MODEL_COLORS[m]} fillOpacity={0.1} strokeWidth={2} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROC Curves */}
      {roc && (
        <div className="card p-6 mb-6">
          <p className="section-label mb-1">ROC Curves</p>
          <p className="text-xs text-warm-400 mb-4">True Positive Rate vs False Positive Rate on test set</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart margin={{ top:5, right:20, bottom:25, left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" />
              <XAxis type="number" domain={[0,1]} dataKey="fpr" label={{ value:'False Positive Rate', position:'insideBottom', offset:-12, fill:'#9a8b78', fontSize:11 }} tick={AXIS_STYLE} tickFormatter={v=>v.toFixed(1)} />
              <YAxis type="number" domain={[0,1]} label={{ value:'True Positive Rate', angle:-90, position:'insideLeft', fill:'#9a8b78', fontSize:11 }} tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize:11, fontFamily:'Inter' }} />
              <ReferenceLine segment={[{x:0,y:0},{x:1,y:1}]} stroke="#d9cdbf" strokeDasharray="4 4" />
              {Object.keys(roc).map(model => (
                <Line key={model} type="monotone" data={roc[model]} dataKey="tpr" name={`${model} (AUC=${metrics[model]?.['AUC-ROC']?.toFixed(3)})`}
                  stroke={MODEL_COLORS[model]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* PR Curves */}
      {pr && (
        <div className="card p-6 mb-6">
          <p className="section-label mb-1">Precision-Recall Curves</p>
          <p className="text-xs text-warm-400 mb-4">Higher and to the right is better</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart margin={{ top:5, right:20, bottom:25, left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" />
              <XAxis type="number" domain={[0,1]} dataKey="recall" label={{ value:'Recall', position:'insideBottom', offset:-12, fill:'#9a8b78', fontSize:11 }} tick={AXIS_STYLE} tickFormatter={v=>v.toFixed(1)} />
              <YAxis type="number" domain={[0,1]} label={{ value:'Precision', angle:-90, position:'insideLeft', fill:'#9a8b78', fontSize:11 }} tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize:11, fontFamily:'Inter' }} />
              {Object.keys(pr).map(model => (
                <Line key={model} type="monotone" data={pr[model]} dataKey="precision" name={model}
                  stroke={MODEL_COLORS[model]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Confusion Matrices */}
      {cms && (
        <div className="card p-6 mb-6">
          <p className="section-label mb-1">Confusion Matrices</p>
          <p className="text-xs text-warm-400 mb-6">From actual test set predictions</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {models.map(name => cms[name] && (
              <ConfusionMatrix key={name} data={cms[name]} name={name} />
            ))}
          </div>
        </div>
      )}

      {/* Inference Time */}
      <div className="card p-6 mb-6">
        <p className="section-label mb-1">Inference Speed</p>
        <p className="text-xs text-warm-400 mb-4">Average ms per sample on test set</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={inferData} margin={{ top:5, right:20, bottom:5, left:10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
            <XAxis dataKey="model" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} unit="ms" />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,_,{payload})=>[`${v.toFixed(3)}ms`, payload.fullName]} />
            <Bar dataKey="ms" radius={[6,6,0,0]}>
              {inferData.map((_, i) => <Cell key={i} fill={MODEL_COLORS[models[i]]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Training History */}
      {history && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {Object.entries(history).map(([key, epochData]) => (
            <div key={key} className="card p-6">
              <p className="section-label mb-1">Training History — {key === 'rnn_lstm' ? 'RNN (LSTM)' : 'DistilBERT'}</p>
              <p className="text-xs text-warm-400 mb-4">Actual training curves</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={epochData} margin={{ top:5, right:20, bottom:5, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" />
                  <XAxis dataKey="epoch" tick={AXIS_STYLE} label={{ value:'Epoch', position:'insideBottom', offset:-3, fill:'#9a8b78', fontSize:11 }} />
                  <YAxis tick={AXIS_STYLE} domain={[0.5,1]} tickFormatter={v=>v.toFixed(2)} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v=>v.toFixed(4)} />
                  <Legend wrapperStyle={{ fontSize:11, fontFamily:'Inter' }} />
                  <Line type="monotone" dataKey="train_acc" name="Train Acc" stroke={key==='rnn_lstm'?'#81b29a':'#e6a54a'} dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="val_acc"   name="Val Acc"   stroke="#5b8fb9" dot={false} strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="train_loss" name="Train Loss" stroke="#e05c8c" dot={false} strokeWidth={1.5} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="val_loss"   name="Val Loss"   stroke="#b8a994" dot={false} strokeWidth={1.5} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}

      {/* Model Agreement */}
      {agreeRaw?.matrix && (
        <div className="card p-6 mb-6">
          <p className="section-label mb-1">Model Agreement Matrix</p>
          <p className="text-xs text-warm-400 mb-4">Fraction of test samples where both models predict the same label</p>
          <div className="overflow-x-auto">
            <table className="text-xs font-display">
              <thead>
                <tr>
                  <th className="p-2 text-warm-400" />
                  {models.map(m => <th key={m} className="p-2 text-warm-600 font-semibold whitespace-nowrap">{m.split(' ')[0]}</th>)}
                </tr>
              </thead>
              <tbody>
                {models.map(m1 => (
                  <tr key={m1}>
                    <td className="p-2 font-semibold text-warm-600 whitespace-nowrap">{m1.split(' ')[0]}</td>
                    {models.map(m2 => {
                      const v = agreeRaw.matrix[m1]?.[m2] || 0
                      const bg = m1===m2 ? MODEL_COLORS[m1] : `rgba(91,143,185,${v * 0.6})`
                      return (
                        <td key={m2} className="p-2 text-center rounded"
                          style={{ background: bg, color: v > 0.7 || m1===m2 ? 'white' : '#5c524a' }}>
                          {m1===m2 ? '—' : `${(v*100).toFixed(1)}%`}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All-wrong samples */}
      {agreeRaw?.all_wrong?.length > 0 && (
        <div className="card p-6">
          <p className="section-label mb-1">Universally Hard Cases</p>
          <p className="text-xs text-warm-400 mb-4">Reviews ALL 4 models got wrong — the hardest cases in the dataset</p>
          <div className="space-y-3">
            {agreeRaw.all_wrong.slice(0,8).map((e, i) => (
              <motion.div key={i} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                className="p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/15">
                <div className="flex items-center gap-2 mb-2">
                  <Badge label={`True: ${e.true_label}`} color={e.true_label} />
                  <span className="text-xs text-warm-400">All 4 models predicted incorrectly</span>
                </div>
                <p className="text-xs text-warm-600 line-clamp-2">"{e.review}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
