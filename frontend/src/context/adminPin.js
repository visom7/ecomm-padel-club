// Store the PIN in memory only (not localStorage for security)
let _adminPin = null

export function setAdminPin(pin) {
  _adminPin = pin
}

export function getAdminPin() {
  return _adminPin
}

export function clearAdminPin() {
  _adminPin = null
}
