const PIN_KEY = 'padel_admin_pin'

export function setAdminPin(pin) {
  sessionStorage.setItem(PIN_KEY, pin)
}

export function getAdminPin() {
  return sessionStorage.getItem(PIN_KEY)
}

export function clearAdminPin() {
  sessionStorage.removeItem(PIN_KEY)
}
