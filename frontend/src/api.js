/**
 * Session-authenticated JSON helpers. Django expects the CSRF header on unsafe methods.
 */
const API = '/workshop/api'

function readCookie(name) {
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return m ? decodeURIComponent(m[2]) : ''
}

export function getCsrfToken() {
  return readCookie('csrftoken')
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const method = (options.method || 'GET').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    const tok = getCsrfToken()
    if (tok) headers['X-CSRFToken'] = tok
    if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json'
    }
  }
  const res = await fetch(API + path, {
    ...options,
    credentials: 'include',
    headers,
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(data?.error || data?.detail || res.statusText || 'Request failed')
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}

export async function refreshCsrf() {
  return apiFetch('/csrf/')
}

/** Multipart upload (does not set Content-Type; browser sets boundary). */
export async function apiUpload(path, formData, method = 'POST') {
  const headers = {}
  const m = (method || 'POST').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(m)) {
    const tok = getCsrfToken()
    if (tok) headers['X-CSRFToken'] = tok
  }
  const res = await fetch(API + path, {
    method: m,
    credentials: 'include',
    headers,
    body: formData,
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(data?.error || data?.detail || res.statusText || 'Request failed')
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}
