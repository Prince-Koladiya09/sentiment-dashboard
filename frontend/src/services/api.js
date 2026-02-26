import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
})

api.interceptors.response.use(
  res => res.data,
  err => { console.error('API Error:', err); throw err }
)

export const getMetrics              = () => api.get('/metrics')
export const getConfusionMatrices    = () => api.get('/confusion-matrices')
export const getRocCurves            = () => api.get('/roc-curves')
export const getPrCurves             = () => api.get('/pr-curves')
export const getTrainingHistory      = () => api.get('/training-history')
export const getErrors               = (params = {}) => api.get('/errors', { params })
export const getLimeExamples         = (model = null) => api.get('/lime-examples', { params: model ? { model } : {} })
export const getConfidenceDist       = () => api.get('/confidence-distribution')
export const getFeatureImportance    = () => api.get('/feature-importance')
export const getDatasetStats         = () => api.get('/dataset/stats')
export const getModelAgreement       = () => api.get('/model-agreement')

export default api
