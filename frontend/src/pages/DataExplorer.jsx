import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { Database, Search } from 'lucide-react'
import { useData } from '../hooks/useData'
import { getDatasetStats } from '../services/api'
import { LoadingSpinner, ErrorBanner, SectionHeader } from '../components/UI'
import { TOOLTIP_STYLE, AXIS_STYLE } from '../constants'

export default function DataExplorer() {
  const { data: stats, loading, error } = useData(getDatasetStats)
  const [sentFilter, setSentFilter]     = useState('all')
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(0)
  const PER = 8

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12"><LoadingSpinner text="Loading dataset statistics..." /></div>
  if (error)   return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorBanner message={error} /></div>

  const reviews = (stats?.sample_reviews || []).filter(r => {
    const okS = sentFilter === 'all' || r.sentiment === (sentFilter === 'positive' ? 1 : 0)
    const okQ = !search || r.text.toLowerCase().includes(search.toLowerCase())
    return okS && okQ
  })
  const paged = reviews.slice(page * PER, (page+1) * PER)
  const pages = Math.ceil(reviews.length / PER)

  const ls = stats?.length_stats || {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader icon={Database} gradient="bg-gradient-to-br from-accent-blue to-accent-sage"
        title="Dataset Explorer"
        subtitle={`IMDB Dataset — ${(stats?.total_reviews || 0).toLocaleString()} reviews · Train: ${(stats?.train_size || 0).toLocaleString()} · Test: ${(stats?.test_size || 0).toLocaleString()}`} />

      {/* Length stats summary */}
      {ls.overall && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label:'Avg Length (All)',      val:`${ls.overall.mean} chars` },
            { label:'Avg Length (Positive)', val:`${ls.positive?.mean} chars`, color:'#81b29a' },
            { label:'Avg Length (Negative)', val:`${ls.negative?.mean} chars`, color:'#e05c8c' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-xl font-display font-bold" style={{ color: s.color || '#e07a5f' }}>{s.val}</div>
              <div className="section-label mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Length Distribution */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label">Review Length Distribution</p>
            <div className="flex gap-1">
              {['all','positive','negative'].map(f => (
                <button key={f} onClick={() => setSentFilter(f)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold capitalize transition-all"
                  style={{ background: sentFilter===f ? 'rgba(224,122,95,0.1)' : 'transparent',
                           color: sentFilter===f ? '#e07a5f' : '#9a8b78',
                           border: `1px solid ${sentFilter===f ? 'rgba(224,122,95,0.25)' : 'transparent'}` }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.length_distribution} margin={{ top:5, right:10, bottom:25, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
              <XAxis dataKey="bucket" tick={{ ...AXIS_STYLE, fontSize:9 }} angle={-45} textAnchor="end" />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              {(sentFilter==='all'||sentFilter==='positive') && <Bar dataKey="positive" name="Positive" fill="#81b29a" fillOpacity={0.85} radius={[4,4,0,0]} />}
              {(sentFilter==='all'||sentFilter==='negative') && <Bar dataKey="negative" name="Negative" fill="#e05c8c" fillOpacity={0.85} radius={[4,4,0,0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Donut */}
        <div className="card p-6">
          <p className="section-label mb-4">Sentiment Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats?.sentiment_distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {stats?.sentiment_distribution?.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize:12, fontFamily:'Inter' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v.toLocaleString(), '']} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-warm-400 mt-1 font-display font-semibold">BALANCED DATASET</p>
        </div>
      </div>

      {/* Length vs Accuracy */}
      {stats?.length_vs_accuracy?.length > 0 && (
        <div className="card p-6 mb-8">
          <p className="section-label mb-1">Review Length vs Model Accuracy</p>
          <p className="text-xs text-warm-400 mb-4">Does review length affect how well models predict sentiment?</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.length_vs_accuracy} margin={{ top:5, right:20, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" vertical={false} />
              <XAxis dataKey="bucket" tick={AXIS_STYLE} label={{ value:'Review Length (chars)', position:'insideBottom', offset:-2, fill:'#9a8b78', fontSize:11 }} />
              <YAxis domain={[0.8,1]} tickFormatter={v=>`${(v*100).toFixed(0)}%`} tick={AXIS_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v,_,{payload})=>[`${(v*100).toFixed(1)}%  (${payload.count} reviews)`, 'Accuracy']} />
              <Bar dataKey="accuracy" fill="#5b8fb9" fillOpacity={0.85} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Words */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[
          { title:'Most Positive Features (LR weights)', data: stats?.top_positive_words, color:'#81b29a' },
          { title:'Most Negative Features (LR weights)', data: stats?.top_negative_words, color:'#e05c8c' },
        ].map(({ title, data, color }) => (
          <div key={title} className="card p-6">
            <p className="section-label mb-1" style={{ color }}>{title}</p>
            <p className="text-xs text-warm-400 mb-4">Word importance from logistic regression coefficients</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.slice(0,15)} layout="vertical" margin={{ top:0, right:20, bottom:0, left:60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ebe3d9" horizontal={false} />
                <XAxis type="number" tick={AXIS_STYLE} />
                <YAxis type="category" dataKey="word" tick={{ fill:'#5c524a', fontSize:11, fontFamily:'Inter' }} width={60} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill={color} fillOpacity={0.8} radius={[0,6,6,0]} name="Weight" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Sample Reviews Table */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="section-label">Sample Reviews from Test Set</p>
          <div className="flex gap-3">
            <div className="flex gap-1">
              {['all','positive','negative'].map(f => (
                <button key={f} onClick={() => { setSentFilter(f); setPage(0) }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-display font-semibold capitalize transition-all"
                  style={{ background: sentFilter===f ? 'rgba(224,122,95,0.1)' : 'transparent',
                           color: sentFilter===f ? '#e07a5f' : '#9a8b78' }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
                placeholder="Search..." className="pl-8 pr-3 py-2 rounded-xl text-xs bg-warm-50 border border-warm-200 focus:outline-none focus:border-accent-coral/40 w-44" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200">
                {['#','Review','Sentiment','Length'].map(h => <th key={h} className="text-left py-3 px-3 section-label">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {paged.map(r => (
                <tr key={r.id} className="border-b border-warm-100 hover:bg-warm-50 transition-colors">
                  <td className="py-3 px-3 text-warm-400 text-xs font-display">{r.id}</td>
                  <td className="py-3 px-3 text-warm-700 max-w-sm"><span className="line-clamp-2 text-xs">{r.text}</span></td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-display font-bold"
                      style={{ background: r.sentiment===1?'rgba(129,178,154,0.12)':'rgba(224,92,140,0.12)',
                               color: r.sentiment===1?'#4a8c6f':'#c04070' }}>
                      {r.sentiment===1?'+ Positive':'– Negative'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-warm-400 text-xs">{r.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-warm-100">
          <span className="text-xs text-warm-400">{reviews.length} reviews</span>
          <div className="flex gap-2 items-center">
            <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold disabled:opacity-30 bg-warm-100 text-warm-600 hover:bg-warm-200">← Prev</button>
            <span className="text-xs font-display text-accent-coral font-semibold">{page+1} / {Math.max(1,pages)}</span>
            <button onClick={() => setPage(p => Math.min(pages-1,p+1))} disabled={page>=pages-1}
              className="px-3 py-1.5 rounded-lg text-xs font-display font-semibold disabled:opacity-30 bg-warm-100 text-warm-600 hover:bg-warm-200">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
