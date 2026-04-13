import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import fosseeLogoUrl from '../assets/image.png'

/* Real FOSSEE workshop names — not placeholder text */
const TICKER_NAMES = [
  'Python for Scientists',
  'Scilab for Engineers',
  'OpenFOAM CFD',
  'Electronic Simulation · eSim',
  'Process Simulation · DWSIM',
  'Structural Design · OSDAG',
  'R for Data Analysis',
  'GNU Octave',
  'Python for Machine Learning',
  'Spoken Tutorial',
]

function Ticker() {
  const items = [...TICKER_NAMES, ...TICKER_NAMES] // duplicate for seamless loop
  return (
    <div className="workshop-ticker">
      <div className="ticker-track">
        {items.map((name, i) => (
          <span key={i} className="ticker-item">{name}</span>
        ))}
      </div>
    </div>
  )
}

export function LoginPage() {
  const { user, loading, reload } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    document.title = 'Sign in · FOSSEE Workshops · IIT Bombay'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'Sign in to the FOSSEE workshop portal — book and manage open-source workshops across India.')
  }, [])

  if (loading) return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--c-bg)',
    }}>
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '50%',
        border: '2.5px solid var(--c-brand)',
        borderTopColor: 'var(--c-accent)',
        animation: 'spin 0.75s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (user?.is_superuser) { window.location.href = '/admin'; return null }
  if (user?.has_profile && user?.profile && !user.profile.email_verified) return <Navigate to="/register" replace />
  if (user?.profile?.email_verified) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      await apiFetch('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      })
      await reload()
    } catch (err) {
      setError(
        err.body?.needs_activation
          ? 'Please verify your email first — check the link we sent when you registered.'
          : err.message || 'Incorrect username or password.'
      )
    } finally { setPending(false) }
  }

  return (
    <div className="auth-page">


      <div className="auth-panel-left">
        {/* Floating circle decorations */}
        <div className="deco-circle deco-circle-1" />
        <div className="deco-circle deco-circle-2" />

        {/* Wordmark */}
        <div className="auth-left-wordmark">
          <div className="auth-left-wordmark-icon">
            <img src={fosseeLogoUrl} alt="FOSSEE" style={{ width: '1.1rem', height: '1.1rem', objectFit: 'contain' }} />
          </div>
          <span className="auth-left-wordmark-text">FOSSEE · IIT Bombay</span>
        </div>

        {/* The ONE statement — concept-focused, no geographic claims */}
        <div className="auth-statement">
          <span className="auth-statement-line">Learn freely.</span>
          <span className="auth-statement-line">Build openly.</span>
          <span className="auth-statement-line amber">Share everything.</span>
          <p className="auth-statement-sub">
            FOSSEE promotes free and open-source tools in science and engineering education — run by IIT Bombay.
          </p>
        </div>


        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.6rem' }}>
            Summer Fellowship Programmes 2026
          </div>
          <Ticker />
        </div>

        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>
          fossee.in · Free and Open Source Software for Education
        </div>
      </div>


      <div className="auth-panel-right">
        <div className="auth-form-box">

          {/* Mobile-only brand */}
          <div className="auth-mobile-brand">
            <img
              src={fosseeLogoUrl} alt="FOSSEE logo"
              style={{ width: '2.4rem', height: '2.4rem', objectFit: 'contain', marginBottom: '0.5rem' }}
            />
            <strong>FOSSEE Workshops</strong>
            <span>IIT Bombay</span>
          </div>

          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub">Sign in to access your workshop portal.</p>

          {error && <div className="banner err" role="alert">{error}</div>}

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="login-user">Username</label>
              <input
                id="login-user" name="username" autoComplete="username"
                value={username} onChange={e => setUsername(e.target.value)}
                placeholder="your_username" required
              />
            </div>

            <div className="field">
              <label htmlFor="login-pass">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-pass" name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: '2.9rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--c-faint)', padding: 0, display: 'flex', alignItems: 'center',
                    transition: 'color 0.12s',
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--c-accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--c-faint)'}
                >
                  {showPass
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary btn-full" type="submit"
              disabled={pending}
              style={{ marginTop: '0.35rem', fontSize: '1rem' }}
            >
              {pending
                ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(26,25,23,0.3)', borderTopColor: 'var(--c-ink)', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in…
                </span>
                : 'Sign in →'
              }
            </button>
          </form>

          <hr className="auth-divider" />

          <p className="text-sm" style={{ textAlign: 'center', color: 'var(--c-muted)' }}>
            No account yet?{' '}
            <Link to="/register" className="inline-link">Create one here</Link>
          </p>
          <p className="text-sm" style={{ textAlign: 'center', marginTop: '0.4rem' }}>
            <a href="/reset/password/" className="inline-link">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  )
}
