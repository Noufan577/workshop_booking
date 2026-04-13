import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

export function ProposePage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [types, setTypes] = useState([])
  const [selected, setSelected] = useState(null)
  const [workshop_type, setWorkshopType] = useState('')
  const [date, setDate] = useState('')
  const [tnc, setTnc] = useState(false)
  const [err, setErr] = useState(null)
  const [pending, setPending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.title = 'Propose a Workshop · FOSSEE'
    apiFetch('/workshop-types/?page=1&per_page=200')
      .then(d => setTypes(d.results || []))
      .catch(() => setErr('Could not load workshop types.'))
  }, [])

  if (loading) return <Layout><div className="skeleton sk-block" /></Layout>
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (user.is_instructor) return <Navigate to="/dashboard" replace />

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 3)
  const minDateStr = minDate.toISOString().split('T')[0]

  function handleTypeChange(e) {
    const id = e.target.value
    setWorkshopType(id)
    setSelected(types.find(t => String(t.id) === id) || null)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr(null); setPending(true)
    try {
      await apiFetch('/workshops/propose/', {
        method: 'POST',
        body: JSON.stringify({ workshop_type: Number(workshop_type), date, tnc_accepted: tnc }),
      })
      setSubmitted(true)
      setTimeout(() => navigate('/status', { replace: true }), 2000)
    } catch (ex) {
      if (ex.body?.errors) {
        const msg = Object.entries(ex.body.errors)
          .map(([k, v]) => `${k}: ${(Array.isArray(v) ? v : [v]).join(', ')}`).join(' ')
        setErr(msg)
      } else { setErr(ex.message || 'Could not submit proposal.') }
    } finally { setPending(false) }
  }

  /* Success overlay */
  if (submitted) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '4rem 1rem', animation: 'fadeUp 0.4s var(--ease) both' }}>
        <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--ok-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', animation: 'popIn 0.5s var(--ease-back) both 0.1s' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ marginBottom: '0.5rem' }}>Proposal submitted!</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '22rem', margin: '0 auto' }}>
          Your request has been logged. An instructor will be assigned and you'll be notified by email.
        </p>
        <style>{`@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    </Layout>
  )

  const canSubmit = workshop_type && date && tnc && !pending

  return (
    <Layout>
      {/* Page header */}
      <div className="propose-header">
        <div className="propose-header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 style={{ marginBottom: '0.2rem' }}>Propose a workshop</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Pick a type, choose a date, and submit — instructors are notified automatically.
          </p>
        </div>
      </div>

      {err && <div className="banner err" role="alert">{err}</div>}

      <form onSubmit={onSubmit}>

        <div className="propose-step-card">
          <div className="propose-step-num">1</div>
          <div style={{ flex: 1 }}>
            <div className="propose-step-label">Choose a workshop type</div>
            <div className="field" style={{ marginBottom: selected ? '0.75rem' : 0 }}>
              <label htmlFor="pw" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Workshop type</label>
              <select id="pw" required value={workshop_type} onChange={handleTypeChange}
                style={{ borderRadius: '999px' }}>
                <option value="">— Select from catalogue —</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.duration}d)</option>
                ))}
              </select>
            </div>


            {selected && (
              <div className="propose-preview" style={{ animation: 'fadeUp 0.25s var(--ease) both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {selected.description.slice(0, 120)}{selected.description.length > 120 ? '…' : ''}
                    </div>
                  </div>
                  <span style={{ background: 'var(--amber-lt)', color: 'var(--warn)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.18rem 0.5rem', borderRadius: '4px', flexShrink: 0 }}>
                    {selected.duration}d
                  </span>
                </div>
                <Link to={`/types/${selected.id}`} className="inline-link" style={{ fontSize: '0.8rem', display: 'inline-block', marginTop: '0.5rem' }}>
                  View full details & terms →
                </Link>
              </div>
            )}
          </div>
        </div>


        <div className={`propose-step-card ${!workshop_type ? 'propose-step-card--dim' : ''}`}>
          <div className={`propose-step-num ${!workshop_type ? '' : 'propose-step-num--active'}`}>2</div>
          <div style={{ flex: 1 }}>
            <div className="propose-step-label">Pick a date</div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="pd" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Date</label>
              <input id="pd" type="date" required
                value={date} min={minDateStr}
                onChange={e => setDate(e.target.value)}
                disabled={!workshop_type}
                style={{ borderRadius: '999px', maxWidth: '14rem' }}
              />
            </div>
            {date && (
              <p style={{ fontSize: '0.78rem', color: 'var(--ok)', marginTop: '0.35rem', fontWeight: 600 }}>
                ✓ {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            {!workshop_type && <p style={{ fontSize: '0.78rem', color: 'var(--faint)', marginTop: '0.35rem' }}>Select a workshop type first</p>}
          </div>
        </div>


        <div className={`propose-step-card ${!date ? 'propose-step-card--dim' : ''}`}>
          <div className={`propose-step-num ${date ? 'propose-step-num--active' : ''}`}>3</div>
          <div style={{ flex: 1 }}>
            <div className="propose-step-label">Accept terms</div>
            <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', cursor: date ? 'pointer' : 'not-allowed' }}>
              <div style={{ position: 'relative', flexShrink: 0, marginTop: '0.05rem' }}>
                <input
                  type="checkbox" checked={tnc} onChange={e => setTnc(e.target.checked)}
                  disabled={!date}
                  style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--amber)', cursor: 'pointer' }}
                  required
                />
              </div>
              <span style={{ fontSize: '0.88rem', color: date ? 'var(--ink)' : 'var(--faint)' }}>
                I have read and accept the{' '}
                {selected
                  ? <Link to={`/types/${selected.id}`} className="inline-link">terms and conditions</Link>
                  : 'terms and conditions'}{' '}
                for this workshop type.
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary btn-full" type="submit"
          disabled={!canSubmit}
          style={{ marginTop: '0.75rem', fontSize: '1rem', position: 'relative', overflow: 'hidden' }}
        >
          {pending
            ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(26,25,23,0.3)', borderTopColor: 'var(--ink)', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Submitting…
              </span>
            : 'Submit proposal →'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '1rem' }}>
        Not sure which type?{' '}
        <Link to="/types" className="inline-link">Browse the catalogue →</Link>
      </p>

      <style>{`
        .propose-header {
          display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1.75rem;
        }
        .propose-header-icon {
          width: 3rem; height: 3rem; border-radius: var(--r);
          background: var(--navy); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 4px 14px rgba(27,35,64,0.18);
        }
        .propose-step-card {
          background: var(--card); border: 1px solid var(--line);
          border-radius: var(--r); padding: 1.1rem 1.2rem;
          margin-bottom: 0.75rem; box-shadow: var(--sh-xs);
          display: flex; gap: 1rem; align-items: flex-start;
          transition: opacity 0.2s, transform 0.2s var(--ease);
        }
        .propose-step-card--dim { opacity: 0.5; transform: none; }
        .propose-step-num {
          width: 1.8rem; height: 1.8rem; border-radius: 50%; flex-shrink: 0;
          background: var(--line); color: var(--faint);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 800; margin-top: 0.15rem;
          transition: background 0.25s var(--ease-back), color 0.25s, transform 0.25s var(--ease-back);
        }
        .propose-step-num--active {
          background: var(--amber); color: var(--ink);
          transform: scale(1.1);
        }
        .propose-step-label {
          font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink); margin-bottom: 0.65rem;
        }
        .propose-preview {
          margin-top: 0.75rem; background: var(--navy-xlt); border: 1px solid var(--navy-lt);
          border-radius: var(--r-sm); padding: 0.8rem 0.9rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  )
}
