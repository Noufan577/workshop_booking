import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

function initials(first, last) {
  return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase() || '?'
}

function roleColor(pos) {
  return pos === 'instructor' ? { bg: 'var(--ok-lt)', color: 'var(--ok)', label: 'Instructor' }
    : { bg: 'var(--amber-lt)', color: 'var(--warn)', label: 'Coordinator' }
}

export function ProfilePage() {
  const { user, loading, reload, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [err, setErr] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  useEffect(() => { document.title = 'Your Profile · FOSSEE' }, [])

  useEffect(() => {
    if (!user?.profile) return
    apiFetch('/profile/')
      .then(d => setForm({
        first_name: d.first_name, last_name: d.last_name,
        title: d.profile.title, institute: d.profile.institute,
        department: d.profile.department, phone_number: d.profile.phone_number,
        position: d.profile.position, location: d.profile.location, state: d.profile.state,
      }))
      .catch(e => setErr(e.message))
  }, [user])

  if (loading) return (
    <Layout>
      <div className="skeleton" style={{ height: '7rem', borderRadius: 'var(--r-lg)', marginBottom: '1rem' }} />
      <div className="skeleton sk-block" />
    </Layout>
  )
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (!form) return <Layout><p className="muted">{err || 'Loading profile…'}</p></Layout>

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault()
    setPending(true); setErr(null); setSaved(false)
    try {
      await apiFetch('/profile/', { method: 'PATCH', body: JSON.stringify(form) })
      await reload()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (ex) { setErr(ex.message) } finally { setPending(false) }
  }

  const role = roleColor(form.position)

  return (
    <Layout>

      <div className="profile-hero">
        <div className="profile-hero-deco" />
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {initials(form.first_name, form.last_name)}
          </div>
          <div className="profile-avatar-ring" />
        </div>
        <div className="profile-hero-info">
          <h1 className="profile-hero-name">
            {form.title && <span className="profile-title">{form.title}.</span>}
            {' '}{form.first_name} {form.last_name}
          </h1>
          <div className="profile-hero-meta">
            <span style={{ background: role.bg, color: role.color }} className="profile-role-badge">
              {role.label}
            </span>
            {form.institute && <span className="profile-hero-institute">· {form.institute}</span>}
            {form.location && <span className="profile-hero-city">· {form.location}</span>}
          </div>
        </div>
      </div>

      {err   && <div className="banner err" role="alert">{err}</div>}
      {saved && (
        <div className="banner ok" role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Profile saved
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Personal details card */}
        <div className="profile-section-card">
          <div className="profile-section-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
            Personal details
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="pf-fn">First name</label>
              <input id="pf-fn" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pf-ln">Last name</label>
              <input id="pf-ln" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pf-ti">Title</label>
              <input id="pf-ti" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-ph">Phone number</label>
              <input id="pf-ph" value={form.phone_number} onChange={e => set('phone_number', e.target.value)} required inputMode="numeric" />
            </div>
          </div>
        </div>

        {/* Institution card */}
        <div className="profile-section-card">
          <div className="profile-section-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
              <path d="M3 21h18M9 21V9l3-6 3 6v12M5 21V13h4M15 21v-8h4v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Institution
          </div>
          <div className="field">
            <label htmlFor="pf-ins">Institute / organisation</label>
            <input id="pf-ins" value={form.institute} onChange={e => set('institute', e.target.value)} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="pf-dep">Department</label>
              <input id="pf-dep" value={form.department} onChange={e => set('department', e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="pf-pos">Role</label>
              <input id="pf-pos" value={form.position} readOnly
                style={{ opacity: 0.65, cursor: 'not-allowed', background: 'var(--bg)' }} />
            </div>
            <div className="field">
              <label htmlFor="pf-loc">City / town</label>
              <input id="pf-loc" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pf-st">State code</label>
              <input id="pf-st" value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={pending}
          style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </form>


      <div className="profile-danger-zone">
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: '0.65rem' }}>
          Session
        </div>
        {!confirmLogout ? (
          <button type="button" className="btn btn-ghost btn-full"
            style={{ borderColor: 'rgba(139,26,26,0.3)', color: 'var(--err)' }}
            onClick={() => setConfirmLogout(true)}>
            Sign out of this device
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', animation: 'fadeUp 0.2s var(--ease) both' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', flex: 1 }}>Sure you want to sign out?</span>
            <button type="button" className="btn btn-danger btn-sm"
              onClick={async () => { await logout(); navigate('/login', { replace: true }) }}>
              Yes, sign out
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmLogout(false)}>Cancel</button>
          </div>
        )}
      </div>

      <style>{`
        .profile-hero {
          position: relative; border-radius: var(--r-lg);
          background: var(--navy); padding: 1.75rem 1.5rem;
          margin-bottom: 1.5rem; overflow: hidden;
          display: flex; align-items: center; gap: 1.25rem;
          box-shadow: 0 8px 28px rgba(27,35,64,0.18);
        }
        .profile-hero-deco {
          position: absolute; right: -4rem; top: -4rem;
          width: 14rem; height: 14rem; border-radius: 50%;
          border: 2rem solid rgba(247,163,91,0.1); pointer-events: none;
        }
        .profile-avatar-wrap { position: relative; flex-shrink: 0; }
        .profile-avatar {
          width: 4rem; height: 4rem; border-radius: 50%;
          background: rgba(247,163,91,0.2); color: var(--amber);
          font-family: var(--font-head); font-size: 1.4rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid rgba(247,163,91,0.4); position: relative; z-index: 1;
        }
        .profile-avatar-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid rgba(247,163,91,0.2);
          animation: spin 8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .profile-hero-name {
          font-family: var(--font-head); font-size: 1.3rem; font-weight: 700;
          color: #fff; letter-spacing: -0.02em; line-height: 1.2; margin: 0;
        }
        .profile-title { color: var(--amber); font-size: 1rem; }
        .profile-hero-meta { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.35rem; }
        .profile-role-badge {
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 4px;
        }
        .profile-hero-institute,
        .profile-hero-city { font-size: 0.82rem; color: rgba(255,255,255,0.45); }

        .profile-section-card {
          background: var(--card); border: 1px solid var(--line);
          border-radius: var(--r); padding: 1.2rem 1.3rem; margin-bottom: 0.85rem;
          box-shadow: var(--sh-xs);
        }
        .profile-section-title {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.09em;
          text-transform: uppercase; color: var(--ink); margin-bottom: 1rem;
          padding-bottom: 0.5rem; border-bottom: 1px solid var(--line);
        }

        .profile-danger-zone {
          margin-top: 0.5rem; border: 1px dashed rgba(139,26,26,0.2);
          border-radius: var(--r); padding: 1rem 1.1rem;
        }
      `}</style>
    </Layout>
  )
}
