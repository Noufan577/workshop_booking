import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'

/* Step config */
const STEPS = [
  { label: 'Account',     icon: '01', hint: 'Set up your login' },
  { label: 'About you',   icon: '02', hint: 'Your personal info' },
  { label: 'Institution', icon: '03', hint: 'Where you\'re from' },
]

export function RegisterPage() {
  const { user, loading, reload } = useAuth()
  const [meta, setMeta] = useState(null)
  const [err, setErr] = useState(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm_password: '',
    title: 'Mr', first_name: '', last_name: '', phone_number: '',
    institute: '', department: 'computer engineering',
    location: '', state: 'IN-MH', how_did_you_hear_about_us: 'FOSSEE website',
  })
  const [pending, setPending] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    document.title = 'Create account · FOSSEE Workshops'
    apiFetch('/meta/').then(setMeta).catch(() => setErr('Could not load form options.'))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2.5px solid var(--navy)', borderTopColor: 'var(--amber)', animation: 'spin 0.75s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (user?.profile?.email_verified) return <Navigate to="/" replace />

  /* Email verify waiting */
  if (user?.has_profile && user?.profile && !user.profile.email_verified) {
    return (
      <div className="reg-page">
        <div className="reg-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'var(--ok-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-head)' }}>Check your inbox</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '22rem', margin: '0 auto 1.25rem' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--ink)' }}>{user.email}</strong>.
            Click it to activate your account — expires in 3 days.
          </p>
          <Link to="/login" className="btn btn-primary">Back to sign in</Link>
        </div>
      </div>
    )
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null); setPending(true)
    try {
      await apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(form) })
      await reload()
    } catch (ex) {
      const first = ex.body?.errors ? Object.values(ex.body.errors)[0] : null
      setErr(Array.isArray(first) ? first[0] : ex.message || 'Registration failed.')
    } finally { setPending(false) }
  }

  const canNext0 = form.username && form.email && form.password && form.confirm_password
  const canNext1 = form.first_name && form.last_name && form.phone_number
  function nextStep(e) { e.preventDefault(); setStep(s => s + 1) }

  return (
    <div className="reg-page">
      {/* Left panel */}
      <div className="reg-left">
        <div className="reg-left-brand">
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)' }}>
            FOSSEE · IIT Bombay
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.9rem,3.5vw,3rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.88)', marginBottom: '1.1rem' }}>
            Join the<br />workshop<br /><span style={{ color: 'var(--amber)' }}>network.</span>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, maxWidth: '18rem' }}>
            Create an account to propose workshops, track bookings, and connect with FOSSEE instructors.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: i === step ? 1 : i < step ? 0.55 : 0.28, transition: 'opacity 0.3s' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
                background: i < step ? 'var(--ok)' : i === step ? 'var(--amber)' : 'rgba(255,255,255,0.08)',
                border: `2px solid ${i === step ? 'var(--amber)' : i < step ? 'var(--ok)' : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: i <= step ? 'var(--ink)' : 'rgba(255,255,255,0.4)',
                fontSize: '0.7rem', fontWeight: 800, transition: 'all 0.3s var(--ease-back)',
                transform: i === step ? 'scale(1.1)' : 'scale(1)',
              }}>
                {i < step
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: i === step ? '#fff' : 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{s.hint}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.06em' }}>
          fossee.in · Free and Open Source Software for Education
        </div>
      </div>

      {/* Right form panel */}
      <div className="reg-right">
        <div className="reg-card">
          {/* Mobile brand */}
          <div className="reg-mobile-brand">
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)' }}>Create account</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--faint)', marginTop: '2px' }}>FOSSEE Workshops · IIT Bombay</div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--amber-dk)', letterSpacing: '0.06em' }}>{STEPS[step].label}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--faint)' }}>Step {step + 1} of {STEPS.length}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--line)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                background: 'linear-gradient(to right, var(--amber), var(--amber-dk))',
                width: `${((step + 1) / STEPS.length) * 100}%`,
                transition: 'width 0.4s var(--ease)',
              }} />
            </div>
          </div>

          {err && <div className="banner err" role="alert">{err}</div>}

          <form onSubmit={step === 2 ? onSubmit : nextStep}>

            {step === 0 && (
              <div style={{ animation: 'fadeUp 0.3s var(--ease) both' }}>
                <div className="field">
                  <label htmlFor="reg-user">Username</label>
                  <input id="reg-user" value={form.username} onChange={e => set('username', e.target.value)}
                    autoComplete="username" placeholder="Choose a username" required />
                </div>
                <div className="field">
                  <label htmlFor="reg-email">Email address</label>
                  <input id="reg-email" type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    autoComplete="email" placeholder="you@college.ac.in" required />
                </div>
                <div className="field">
                  <label htmlFor="reg-pass">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="reg-pass" type={showPass ? 'text' : 'password'} value={form.password}
                      onChange={e => set('password', e.target.value)}
                      autoComplete="new-password" placeholder="Minimum 8 characters"
                      style={{ paddingRight: '2.8rem' }} required />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', padding: 0 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                          : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="reg-pass2">Confirm password</label>
                  <input id="reg-pass2" type="password" value={form.confirm_password}
                    onChange={e => set('confirm_password', e.target.value)}
                    autoComplete="new-password" placeholder="Repeat your password" required />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={!canNext0}>Continue →</button>
              </div>
            )}


            {step === 1 && (
              <div style={{ animation: 'fadeUp 0.3s var(--ease) both' }}>
                <div className="field">
                  <label htmlFor="reg-title">Title</label>
                  <select id="reg-title" value={form.title} onChange={e => set('title', e.target.value)}>
                    {(meta?.titles || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="reg-fn">First name</label>
                    <input id="reg-fn" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-ln">Last name</label>
                    <input id="reg-ln" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="reg-phone">Phone number</label>
                  <input id="reg-phone" inputMode="numeric" pattern="\d{10}" value={form.phone_number}
                    onChange={e => set('phone_number', e.target.value)} placeholder="10-digit mobile number" required />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={!canNext1}>Continue →</button>
                </div>
              </div>
            )}


            {step === 2 && (
              <div style={{ animation: 'fadeUp 0.3s var(--ease) both' }}>
                <div className="field">
                  <label htmlFor="reg-ins">Institute / organisation</label>
                  <input id="reg-ins" value={form.institute} onChange={e => set('institute', e.target.value)} placeholder="College or university name" required />
                </div>
                <div className="field">
                  <label htmlFor="reg-dep">Department</label>
                  <select id="reg-dep" value={form.department} onChange={e => set('department', e.target.value)}>
                    {(meta?.departments || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="reg-loc">City / town</label>
                    <input id="reg-loc" value={form.location} onChange={e => set('location', e.target.value)} placeholder="City" required />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-st">State</label>
                    <select id="reg-st" value={form.state} onChange={e => set('state', e.target.value)}>
                      {(meta?.states || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="reg-src">How did you hear about us?</label>
                  <select id="reg-src" value={form.how_did_you_hear_about_us} onChange={e => set('how_did_you_hear_about_us', e.target.value)}>
                    {(meta?.sources || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={pending || !meta}>
                    {pending ? 'Creating…' : 'Create account →'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '1.1rem 0' }} />
          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted)', margin: 0 }}>
            Already have an account? <Link to="/login" className="inline-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .reg-page {
          min-height: 100dvh; display: grid; grid-template-columns: 1fr;
          background: var(--bg);
        }
        @media (min-width: 800px) { .reg-page { grid-template-columns: 1fr 1fr; } }
        .reg-left {
          display: none; flex-direction: column; justify-content: space-between;
          background: var(--navy); padding: 2.75rem; position: relative; overflow: hidden;
        }
        @media (min-width: 800px) { .reg-left { display: flex; } }
        .reg-left::before {
          content: ''; position: absolute; bottom: -6rem; right: -6rem;
          width: 20rem; height: 20rem; border-radius: 50%;
          border: 2rem solid rgba(247,163,91,0.07); pointer-events: none;
        }
        .reg-right {
          display: flex; align-items: center; justify-content: center;
          padding: 2rem 1.25rem;
        }
        .reg-card { width: 100%; max-width: 22rem; animation: fadeUp 0.4s var(--ease) both; }
        .reg-mobile-brand { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.75rem; text-align: center; }
        @media (min-width: 800px) { .reg-mobile-brand { display: none; } }
      `}</style>
    </div>
  )
}
