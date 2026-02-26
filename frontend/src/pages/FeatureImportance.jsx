import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Star } from 'lucide-react'
import { useData } from '../hooks/useData'
import { getFeatureImportance } from '../services/api'
import { LoadingSpinner, ErrorBanner, SectionHeader } from '../components/UI'
import { TOOLTIP_STYLE, AXIS_STYLE, MODEL_COLORS } from '../constants'

export default function FeatureImportance() {
  const { data, loading, error } = useData(getFeatureImportance)
  const [activeModel, setActiveModel] = useState(null)
  const [topN, setTopN] = useState(20)

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12"><LoadingSpinner text="Loading feature importance..." /></div>
  if (error)   return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorBanner message={error} /></div>

  const models = Object.keys(data || {})
  const selModel = activeModel || models[0]
  if (!models.length) return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorBanner message="No feature importance data available." /></div>

  const modelData = data[selModel]
  const posWords  = (modelData?.positive || []).slice(0, topN)
  const negWords  = (modelData?.negative || []).slice(0, topN)
  const color     = MODEL_COLORS[selModel] || '#e07a5f'

  const combinedData = [
    ...negWords.map(w => ({ word: w.word, weight: -Math.abs(w.weight), type: 'negative' })).reverse(),
    ...posWords.map(w => ({ word: w.word, weight:  Math.abs(w.weight), type: 'positive' })),
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={Star} gradient="bg-gradient-to-br from-accent-amber to-accent-plum"
        title="Feature Importance"
        subtitle="Which words carry the most weight in each model's decision?" />

      {/* Model selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {models.map(m => (
          <button key={m} onClick={() => setActiveModel(m)}
            className="px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all"
            style={{
              background: selModel===m ? `${MODEL_COLORS[m]}20` : 'rgba(235,227,217,0.5)',
              color: selModel===m ? MODEL_COLORS[m] : '#9a8b78',
              border: `1.5px solid ${selModel===m ? MODEL_COLORS[m]+'50' : 'transparent'}`
            }}>
            {m}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-warm-400">Top</span>
          {[10,20,30].map(n => (
            <button key={n} onClick={() => setTopN(n)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-all"
              style={{ background: topN===n?'rgba(224,122,95,0.12)':'transparent',
                       color: topN===n?'#e07a5f':'#9a8b78' }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[
          { title: 'Most Positive Words', words: posWords, barColor: '#81b29a', note: 'High weight → model predicts POSITIVE' },
          { title: 'Most Negative Words', words: negWords, barColor: '#e05c8c', note: 'High weight → model predicts NEGATIVE' },
        ].map(({ title, words, barColor, note }) => (
          <div key={title} className="card p-6">
            <p className="section-label mb-1">{title}</p>
            <p className="text-xs text-warm-400 mb-4">{note}</p>
            <ResponsiveContainer width="100%" height={Math.max(200, words.length * 22)}>
              <BarChart data={words} layout="vertical" margin={{ top:0, right:60, bottom:0, left:70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" horizontal={false} />
                <XAxis type="number" tick={{ ...AXIS_STYLE, fontSize:10 }} />
                <YAxis type="category" dataKey="word" tick={{ fill:'#5c524a', fontSize:11, fontFamily:'Inter' }} width={70} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [Math.abs(v).toFixed(4), 'Weight']} />
                <Bar dataKey="weight" fill={barColor} fillOpacity={0.85} radius={[0,6,6,0]} name="Weight">
                  {words.map((_, i) => (
                    <Cell key={i} fillOpacity={0.9 - i * (0.4/words.length)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Combined diverging bar */}
      <div className="card p-6">
        <p className="section-label mb-1">Combined Feature Weights (Diverging)</p>
        <p className="text-xs text-warm-400 mb-6">
          Negative weights push toward negative sentiment · Positive weights push toward positive sentiment
        </p>
        <ResponsiveContainer width="100%" height={Math.max(300, combinedData.length * 18)}>
          <BarChart data={combinedData} layout="vertical" margin={{ top:0, right:80, bottom:0, left:80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" horizontal={false} />
            <XAxis type="number" tick={{ ...AXIS_STYLE, fontSize:10 }} />
            <YAxis type="category" dataKey="word" tick={{ fill:'#5c524a', fontSize:10, fontFamily:'Inter' }} width={80} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,_,{payload}) => [
              v.toFixed(4), payload.type === 'positive' ? '→ Positive' : '→ Negative'
            ]} />
            <Bar dataKey="weight" radius={[0,4,4,0]} name="Weight">
              {combinedData.map((d, i) => (
                <Cell key={i} fill={d.type === 'positive' ? '#81b29a' : '#e05c8c'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model notes */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { model: 'Naive Bayes', note: 'Weights are log-probabilities. High values mean the word appears much more often in that class during training.' },
          { model: 'Logistic Regression', note: 'Weights are TF-IDF feature coefficients. Directly interpretable as log-odds contribution per unit of TF-IDF.' },
        ].map(({ model, note }) => (
          <div key={model} className="card p-4 flex gap-3">
            <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: MODEL_COLORS[model] }} />
            <div>
              <p className="text-xs font-display font-bold text-warm-700 mb-1">{model}</p>
              <p className="text-xs text-warm-500 leading-relaxed">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
