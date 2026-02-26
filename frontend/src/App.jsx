import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home            from './pages/Home'
import DataExplorer    from './pages/DataExplorer'
import ModelComparison from './pages/ModelComparison'
import ErrorAnalysis   from './pages/ErrorAnalysis'
import LimeExplorer    from './pages/LimeExplorer'
import FeatureImportance from './pages/FeatureImportance'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm-25">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/"           element={<Home />} />
            <Route path="/data"       element={<DataExplorer />} />
            <Route path="/comparison" element={<ModelComparison />} />
            <Route path="/errors"     element={<ErrorAnalysis />} />
            <Route path="/lime"       element={<LimeExplorer />} />
            <Route path="/features"   element={<FeatureImportance />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
