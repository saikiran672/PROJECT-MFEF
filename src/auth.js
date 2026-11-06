const tokenKey = 'shopeasy.auth.token'
const localKey = 'shopeasy.auth.local'
const offlineKey = 'shopeasy.auth.offline'
const currentUserKey = 'shopeasy.auth.currentUser'

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export const getToken = () => window.localStorage.getItem(tokenKey) || ''
export const setToken = (token) => (token ? window.localStorage.setItem(tokenKey, token) : window.localStorage.removeItem(tokenKey))

const publicUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  avatarColor: user.avatarColor || '#1f513b',
  createdAt: user.createdAt,
})

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, token = getToken() } = {}) {
  let response
  try {
    response = await fetch('/api' + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('The shop API is unreachable', 0)
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(data.message || 'Request failed', response.status)
  return data
}

const isOfflineError = (error) => error instanceof ApiError && (error.status === 0 || error.status === 503)
const isAuthError = (error) => error instanceof ApiError && (error.status === 401 || error.status === 403)

export function offlineMode() {
  return read(offlineKey, false)
}

function localAccounts() {
  return read(localKey, {})
}

function saveLocalAccount(account) {
  const accounts = localAccounts()
  accounts[account.email] = account
  write(localKey, accounts)
}

async function localRegister({ name, email, password }) {
  const accounts = localAccounts()
  if (accounts[email]) throw new Error('An account with this email already exists')
  const palette = ['#1f513b', '#d65b35', '#c99a3d', '#2d7657', '#7a4f9c', '#20607a']
  const account = {
    user: { id: 'local-' + Date.now(), name, email, phone: '', avatarColor: palette[Math.floor(Math.random() * palette.length)], createdAt: new Date().toISOString() },
    password,
  }
  saveLocalAccount(account)
  return { token: '', user: account.user, offline: true }
}

async function localLogin({ email, password }) {
  const account = localAccounts()[email]
  if (!account || account.password !== password) throw new Error('Incorrect email or password')
  return { token: '', user: account.user, offline: true }
}

async function localUpdate(changes) {
  const stored = read(currentUserKey, null)
  if (!stored) throw new Error('Please sign in again')
  const updated = publicUser({ ...stored, name: changes.name ?? stored.name, email: changes.email ?? stored.email, phone: changes.phone ?? stored.phone })
  const accounts = localAccounts()
  const previousEmail = stored.email
  if (previousEmail !== updated.email && accounts[previousEmail]) {
    const account = accounts[previousEmail]
    delete accounts[previousEmail]
    account.user = updated
    accounts[updated.email] = account
  } else if (accounts[updated.email]) {
    accounts[updated.email].user = updated
  }
  write(localKey, accounts)
  write(currentUserKey, updated)
  return { user: updated }
}

async function withOfflineFallback(apiCall, localCall) {
  try {
    const result = await apiCall()
    write(offlineKey, false)
    return result
  } catch (error) {
    if (!isOfflineError(error)) throw error
    write(offlineKey, true)
    return localCall()
  }
}

export const register = (credentials) =>
  withOfflineFallback(() => request('/auth/register', { method: 'POST', body: credentials }), () => localRegister(credentials))

export const login = (credentials) =>
  withOfflineFallback(() => request('/auth/login', { method: 'POST', body: credentials }), () => localLogin(credentials))

export const fetchSession = () => request('/auth/me').then((data) => ({ user: publicUser(data.user) }))
export { isAuthError }

export const updateProfile = (changes) =>
  withOfflineFallback(
    () => request('/profile', { method: 'PATCH', body: changes }),
    () => localUpdate(changes),
  )

export const placeOrder = (payload) => request('/orders', { method: 'POST', body: payload })

export const fetchOrders = () => request('/orders').then((data) => data.orders || [])

export function normalizeSession(result) {
  if (result?.token) setToken(result.token)
  else if (result?.offline) setToken('')
  const user = result.user ? publicUser(result.user) : null
  if (user) write(currentUserKey, user)
  return user
}

export function clearSession() {
  setToken('')
  write(currentUserKey, null)
}

export function rememberedUser() {
  return read(currentUserKey, null)
}

const wishlistKey = () => 'shopeasy.wishlist.' + (rememberedUser()?.id || 'guest')

export function readWishlist() {
  return read(wishlistKey(), [])
}

export function writeWishlist(ids) {
  write(wishlistKey(), ids)
}

const localOrdersKey = () => 'shopeasy.orders.' + (rememberedUser()?.id || 'guest')

export function readLocalOrders() {
  return read(localOrdersKey(), [])
}

export function appendLocalOrder(order) {
  const orders = readLocalOrders()
  write(localOrdersKey(), [{ ...order, createdAt: new Date().toISOString() }, ...orders].slice(0, 30))
}
