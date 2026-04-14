const BASE_URL = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
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
  // Create a dummy matchday to test PIN — actually validate by calling a protected endpoint
  // We use a lightweight check: try close on a non-existent id; 404 means PIN is OK, 401 means wrong
  try {
    await request('/matchdays/__pin_check__/close', { method: 'POST', headers: { 'X-Admin-Pin': pin } })
    return true
  } catch (e) {
    if (e.message.includes('404') || e.message.toLowerCase().includes('not found')) return true
    return false
  }
}
