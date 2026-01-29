import axios from 'axios'

const API_BASE = '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============ ATHLETES ============

export const getAthletes = () => api.get('/athletes')

export const getAthlete = (id) => api.get(`/athletes/${id}`)

export const createAthlete = (data) => api.post('/athletes', data)

export const updateAthlete = (id, data) => api.put(`/athletes/${id}`, data)

export const deleteAthlete = (id) => api.delete(`/athletes/${id}`)

export const exportAthlete = (id) => {
  return api.get(`/athletes/${id}/export`, { responseType: 'blob' })
}

// ============ METRIC DEFINITIONS ============

export const getMetricDefinitions = (athleteId) => api.get(`/athletes/${athleteId}/metrics`)

export const createMetricDefinition = (athleteId, data) => api.post(`/athletes/${athleteId}/metrics`, data)

export const updateMetricDefinition = (id, data) => api.put(`/metrics/${id}`, data)

export const deleteMetricDefinition = (id) => api.delete(`/metrics/${id}`)

export const duplicateMetricDefinition = (id) => api.post(`/metrics/${id}/duplicate`)

// ============ METRIC VALUES ============

export const getMetricValues = (definitionId) => api.get(`/metrics/${definitionId}/values`)

export const addMetricValues = (definitionId, data) => api.post(`/metrics/${definitionId}/values`, data)

export const updateMetricValue = (valueId, data) => api.put(`/metrics/values/${valueId}`, data)

export const deleteMetricValue = (valueId) => api.delete(`/metrics/values/${valueId}`)

// ============ CHARTS ============

export const getCharts = (athleteId) => api.get(`/athletes/${athleteId}/charts`)

export const createChart = (athleteId, data) => api.post(`/athletes/${athleteId}/charts`, data)

export const updateChart = (id, data) => api.put(`/charts/${id}`, data)

export const deleteChart = (id) => api.delete(`/charts/${id}`)

export default api
