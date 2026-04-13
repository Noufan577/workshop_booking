import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

/* Tiny inline progress bar — 0, 1, or 2 filled steps */
function StatusTrack({ status }) {
  const steps = [
    { key: 0, label: 'Proposed' },
    { key: 1, label: 'Accepted' },
    { key: 2, label: 'Done' },
  ]
  const reached = status === 1 ? 1 : status === 2 ? 2 : 0
  return (
    <div className="status-track" aria-label={`Status: ${steps[reached]?.label || 'Pending'}`}>
      {steps.map((s, i) => (
        <div key={s.key} className="status-track-item">
          <div className={`status-track-dot ${i <= reached ? 'filled' : ''} ${i === reached ? 'current' : ''}`} />
          <span className="status-track-label">{s.label}</span>
          {i < steps.length - 1 && (
            <div className={`status-track-line ${i < reached ? 'filled' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export function StatusPage() {
  const { user, loading } = useAuth()
  const [rows, setRows] = useState([])
  const [err, setErr] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => { document.title = 'My Workshops · FOSSEE' }, [])

  useEffect(() => {
    if (!user || user.is_instructor) return
    apiFetch('/workshops/coordinator/')
      .then(d => { setRows(d.workshops || []); setFetching(false) })
      .catch(e => { setErr(e.message); setFetching(false) })
  }, [user])

  if (loading) return (
    <Layout>
      <div className="skeleton sk-line wide" style={{ marginBottom: '1rem' }} />
      {[1, 2, 3].map(i => <div key={i} className="skeleton sk-block" style={{ marginBottom: '0.75rem' }} />)}
    </Layout>
  )

  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (user.is_instructor) return <Navigate to="/dashboard" replace />

  const accepted = rows.filter(w => w.status === 1)
  const pending = rows.filter(w => w.status === 0)
  const cancelled = rows.filter(w => w.status === 2)

  function WorkshopCard({ w, idx }) {
    const isExpanded = expandedId === w.id
    const isPending = w.status === 0
    const isAccepted = w.status === 1

    return (
      <div
        className={`ws-status-card ${isAccepted ? 'ws-status-card--ok' : isPending ? 'ws-status-card--pending' : 'ws-status-card--grey'}`}
        style={{ animationDelay: `${idx * 0.06}s` }}
      >
        {/* Click anywhere to expand */}
        <button
          type="button"
          className="ws-status-card-header"
          onClick={() => setExpandedId(isExpanded ? null : w.id)}
          aria-expanded={isExpanded}
        >
          <div>
            <div className="ws-status-card-name">{w.workshop_type.name}</div>
            <div className="ws-status-card-date">{w.date}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span className={isAccepted ? 'pill pill-accepted' : isPending ? 'pill pill-pending' : 'pill pill-deleted'}>
              {isAccepted ? 'Accepted' : isPending ? 'Pending' : 'Cancelled'}
            </span>
            <span className="ws-expand-chevron" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s', color: 'var(--c-faint)', fontSize: '0.75rem' }}>▼</span>
          </div>
        </button>

        {/* Progress track — always visible */}
        {w.status !== 2 && <StatusTrack status={w.status} />}

        {/* Expanded detail */}
        {isExpanded && (
          <div className="ws-status-detail">
            {isAccepted && w.instructor && (
              <div className="ws-status-meta-row">
                <span className="ws-status-meta-key">Instructor</span>
                <span className="ws-status-meta-val">{w.instructor.name}</span>
              </div>
            )}
            {isPending && (
              <div className="ws-status-meta-row">
                <span className="ws-status-meta-key">Status</span>
                <span className="ws-status-meta-val">Waiting for an instructor to accept</span>
              </div>
            )}
            <div className="ws-status-meta-row">
              <span className="ws-status-meta-key">Date</span>
              <span className="ws-status-meta-val">{w.date}</span>
            </div>
            <div style={{ marginTop: '0.65rem' }}>
              <Link to={`/workshops/${w.id}`} className="btn btn-ghost btn-sm">View thread →</Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1>My Workshops</h1>
          {rows.length > 0 && <span className="pill pill-brand">{rows.length} total</span>}
        </div>
        <p className="lede">
          Track all workshops you have proposed. Tap a card to see details.
        </p>
      </div>

      {/* Quick action */}
      <Link to="/propose" className="propose-cta">
        <span>+ Propose a new workshop</span>
        <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>Browse catalogue →</span>
      </Link>

      {err && <div className="banner err" role="alert">{err}</div>}
      {fetching && [1, 2].map(i => <div key={i} className="skeleton sk-block" style={{ marginBottom: '0.75rem' }} />)}

      {!fetching && rows.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-faint)" strokeWidth="1.4">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p>No workshops yet.</p>
            <p style={{ fontSize: '0.88rem' }}>
              <Link to="/types">Browse the catalogue</Link> and propose a date that works for your lab.
            </p>
            <Link to="/propose" className="btn btn-primary btn-sm">Propose a workshop →</Link>
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <div className="section-head"><h2>Confirmed</h2></div>
          {accepted.map((w, i) => <WorkshopCard key={w.id} w={w} idx={i} />)}
        </section>
      )}

      {pending.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <div className="section-head"><h2>Awaiting instructor</h2></div>
          {pending.map((w, i) => <WorkshopCard key={w.id} w={w} idx={i} />)}
        </section>
      )}

      {cancelled.length > 0 && (
        <section>
          <div className="section-head"><h2>Cancelled</h2></div>
          {cancelled.map((w, i) => <WorkshopCard key={w.id} w={w} idx={i} />)}
        </section>
      )}

      <style>{`
        /* Propose CTA strip */
        .propose-cta {
          display: flex; justify-content: space-between; align-items: center;
          background: var(--c-brand); color: #fff; text-decoration: none;
          padding: 0.85rem 1.1rem; border-radius: var(--r);
          margin-bottom: 1.25rem; font-weight: 600; font-size: 0.92rem;
          transition: background 0.15s, transform 0.15s var(--ease);
          border-bottom: 3px solid var(--c-accent);
        }
        .propose-cta:hover { background: var(--c-brand-mid); transform: translateY(-1px); color: #fff; }

        /* Workshop status card */
        .ws-status-card {
          background: var(--c-card); border: 1px solid var(--c-line);
          border-radius: var(--r); margin-bottom: 0.7rem;
          box-shadow: var(--sh-xs); overflow: hidden;
          animation: fadeUp 0.35s var(--ease) both;
          border-left: 3px solid var(--c-line);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ws-status-card:hover { box-shadow: var(--sh-sm); }
        .ws-status-card--ok      { border-left-color: var(--c-ok); }
        .ws-status-card--pending { border-left-color: var(--c-accent); }
        .ws-status-card--grey    { border-left-color: var(--c-faint); opacity: 0.7; }

        .ws-status-card-header {
          width: 100%; background: none; border: none; cursor: pointer;
          padding: 0.9rem 1.1rem;
          display: flex; justify-content: space-between; align-items: center;
          gap: 0.75rem; text-align: left;
          transition: background 0.12s;
        }
        .ws-status-card-header:hover { background: var(--c-brand-xlt); }
        .ws-status-card-name { font-weight: 700; font-size: 0.97rem; font-family: var(--font-head); }
        .ws-status-card-date { font-size: 0.8rem; color: var(--c-muted); margin-top: 0.1rem; }

        /* Progress track */
        .status-track {
          display: flex; align-items: center; padding: 0 1.1rem 0.75rem;
          gap: 0;
        }
        .status-track-item {
          display: flex; align-items: center; gap: 0;
        }
        .status-track-dot {
          width: 0.65rem; height: 0.65rem; border-radius: 50%;
          border: 2px solid var(--c-line); background: var(--c-card); flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s, transform 0.2s var(--ease-back);
        }
        .status-track-dot.filled { background: var(--c-ok); border-color: var(--c-ok); }
        .status-track-dot.current { background: var(--c-accent); border-color: var(--c-accent); transform: scale(1.3); }
        .status-track-label {
          font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--c-faint); padding: 0 0.3rem;
          white-space: nowrap;
        }
        .status-track-line {
          height: 1.5px; background: var(--c-line); flex: 1; min-width: 1.5rem;
          transition: background 0.3s;
        }
        .status-track-line.filled { background: var(--c-ok); }

        /* Expanded detail */
        .ws-status-detail {
          padding: 0 1.1rem 0.9rem;
          border-top: 1px dashed var(--c-line);
          padding-top: 0.75rem;
          animation: fadeUp 0.2s var(--ease) both;
        }
        .ws-status-meta-row {
          display: flex; gap: 0.75rem; align-items: baseline;
          font-size: 0.86rem; margin-bottom: 0.35rem;
        }
        .ws-status-meta-key {
          font-weight: 700; font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 0.07em; color: var(--c-faint); min-width: 4.5rem;
        }
        .ws-status-meta-val { color: var(--c-ink); }
      `}</style>
    </Layout>
  )
}
