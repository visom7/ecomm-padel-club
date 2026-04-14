const BASE_URL = '/api'

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    ...rest,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
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
