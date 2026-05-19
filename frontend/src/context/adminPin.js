const PIN_KEY = 'padel_admin_pin'
const TS_KEY = 'padel_admin_pin_ts'
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

export function setAdminPin(pin) {
  localStorage.setItem(PIN_KEY, pin)
  localStorage.setItem(TS_KEY, String(Date.now()))
}

export function getAdminPin() {
  const pin = localStorage.getItem(PIN_KEY)
  if (!pin) return null
  const ts = Number(localStorage.getItem(TS_KEY))
  if (!ts || Date.now() - ts > MAX_AGE_MS) {
    clearAdminPin()
    return null
  }
  localStorage.setItem(TS_KEY, String(Date.now()))
  return pin
}

export function clearAdminPin() {
  localStorage.removeItem(PIN_KEY)
  localStorage.removeItem(TS_KEY)
}
