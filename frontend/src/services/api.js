import { clearAdminPin } from '../context/adminPin'

const BASE_URL = '/api'

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  })
  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function handleAdminError(err, navigate, setError) {
  if (err.message === 'UNAUTHORIZED') {
    clearAdminPin()
    navigate('/')
  } else if (setError) {
    setError('Error: ' + err.message)
  } else {
    alert('Error: ' + err.message)
  }
}

// Players
export const getPlayers = () => request('/players')

// Matchdays
export const getActiveMatchdays = () => request('/matchdays/active')
export const getPlayedMatchdays = () => request('/matchdays/played')
export const getMatchday = (id) => request(`/matchdays/${id}`)

export const createMatchday = (data, pin) =>
  request('/matchdays', { method: 'POST', body: JSON.stringify(data), headers: { 'X-Admin-Pin': pin } })

export const updateMatchday = (id, data, pin) =>
  request(`/matchdays/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'X-Admin-Pin': pin } })

export const deleteMatchday = (id, pin) =>
  request(`/matchdays/${id}`, { method: 'DELETE', headers: { 'X-Admin-Pin': pin } })

export const respondToMatchday = (id, data) =>
  request(`/matchdays/${id}/response`, { method: 'POST', body: JSON.stringify(data) })

export const submitResult = (id, data, pin) =>
  request(`/matchdays/${id}/result`, { method: 'POST', body: JSON.stringify(data), headers: { 'X-Admin-Pin': pin } })

export const closeMatchday = (id, pin) =>
  request(`/matchdays/${id}/close`, { method: 'POST', headers: { 'X-Admin-Pin': pin } })

export const verifyAdminPin = async (pin) => {
  try {
    await request('/admin/verify-pin', { method: 'POST', body: JSON.stringify({ pin }) })
    return true
  } catch (e) {
    return false
  }
}

// Competitions
export const getCompetitions = () => request('/competitions')
export const createCompetition = (data, pin) =>
  request('/competitions', { method: 'POST', body: JSON.stringify(data), headers: { 'X-Admin-Pin': pin } })

export const updateCompetition = (id, data, pin) =>
  request(`/competitions/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { 'X-Admin-Pin': pin } })

export const deleteCompetition = (id, pin) =>
  request(`/competitions/${id}`, { method: 'DELETE', headers: { 'X-Admin-Pin': pin } })

export const getCompetitionStats = (id) => request(`/competitions/${id}/stats`)

// Player global stats
export const getPlayerGlobalStats = () => request('/players/stats')

// Beer rounds
export const getBeerRounds = () => request('/beer-rounds')
export const getBeerRoundStats = () => request('/beer-rounds/stats')
export const markBeerRoundPaid = (id, pin) =>
  request(`/beer-rounds/${id}`, { method: 'DELETE', headers: { 'X-Admin-Pin': pin } })
