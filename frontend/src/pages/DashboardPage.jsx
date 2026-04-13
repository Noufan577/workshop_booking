import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

function daysUntil(dateStr) {
  const d = new Date(dateStr)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / 86400000)
  if (diff < 0) return 'Past'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `${diff}d away`
}

export function DashboardPage() {
  const { user, loading, reload } = useAuth()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => { document.title = 'Instructor Inbox · FOSSEE' }, [])

  const load = useMemo(() => () =>
    apiFetch('/workshops/instructor/')
      .then(d => { setData(d); setFetching(false) })
      .catch(e => { setErr(e.message); setFetching(false) }),
    []
  )

  useEffect(() => { if (!user?.is_instructor) return; load() }, [user, load])

  async function accept(id) {
    if (!window.confirm('Accept this workshop? You will be listed as the instructor.')) return
    setBusy(id); setErr(null)
    try {
      await apiFetch(`/workshops/${id}/accept/`, { method: 'POST', body: '{}' })
      await reload(); load()
    } catch (e) { setErr(e.message) } finally { setBusy(null) }
  }

  async function bumpDate(id, current) {
    const next = window.prompt('New date (YYYY-MM-DD)', current)
    if (!next) return
    setBusy(id); setErr(null)
    try {
      await apiFetch(`/workshops/${id}/date/`, { method: 'POST', body: JSON.stringify({ new_date: next }) })
      load()
    } catch (e) { setErr(e.message) } finally { setBusy(null) }
  }

  if (loading) return (
    <Layout>
      <div className="skeleton sk-block" style={{ height: '6rem', borderRadius: 'var(--r)', marginBottom: '1rem' }} />
      {[1, 2].map(i => <div key={i} className="skeleton sk-block" style={{ marginBottom: '0.75rem' }} />)}
    </Layout>
  )

  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (!user.is_instructor) return <Navigate to="/status" replace />

  const rows = data?.workshops || []
  const pending = rows.filter(w => w.status === 0)
  const accepted = rows.filter(w => w.status === 1)

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Layout>
      {/* Greeting banner */}
      <div className="greeting-banner">
        <div className="greeting-banner-deco" />
        <div className="greeting-date">{today}</div>
        <div className="greeting-name">{greeting}, {user.first_name || user.username}</div>
        <div className="greeting-msg">
          {pending.length > 0
            ? `${pending.length} workshop${pending.length > 1 ? 's' : ''} awaiting your acceptance`
            : 'Your inbox is clear — enjoy your day.'}
        </div>
        {pending.length > 0 && (
          <div className="stat-row">
            <div className="stat-box">
              <div className="num">{pending.length}</div>
              <div className="lbl">Pending</div>
            </div>
            <div className="stat-box">
              <div className="num">{accepted.length}</div>
              <div className="lbl">Confirmed</div>
            </div>
          </div>
        )}
      </div>

      {err && <div className="banner err" role="alert">{err}</div>}
      {fetching && <><div className="skeleton sk-block" /><div className="skeleton sk-block" /></>}

      {/* Pending — timeline style */}
      {pending.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div className="section-head">
            <h2>Pending proposals</h2>
            <span className="pill pill-pending">{pending.length}</span>
          </div>
          <div className="timeline">
            {pending.map((w, idx) => (
              <div key={w.id} className="timeline-item" style={{ animationDelay: `${idx * 0.07}s` }}>
                <div className="timeline-dot timeline-dot--pending" />
                <div className="timeline-card">
                  <div className="timeline-card-top">
                    <div>
                      <div className="timeline-card-name">{w.workshop_type.name}</div>
                      <div className="timeline-card-meta">
                        <span className="timeline-date-badge">{w.date}</span>
                        <span className="timeline-days-away pending">{daysUntil(w.date)}</span>
                      </div>
                      <div className="timeline-card-sub">
                        <Link to={`/users/${w.coordinator.id}`} className="inline-link">{w.coordinator.name}</Link>
                        {' · '}{w.coordinator.email}
                      </div>
                    </div>
                  </div>
                  <div className="timeline-actions">
                    <button
                      type="button" className="btn btn-primary btn-sm"
                      disabled={busy === w.id} onClick={() => accept(w.id)}
                    >
                      {busy === w.id ? 'Accepting…' : '✓ Accept'}
                    </button>
                    <Link to={`/workshops/${w.id}`} className="btn btn-ghost btn-sm">Discussion</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepted — compact timeline */}
      {accepted.length > 0 && (
        <div>
          <div className="section-head">
            <h2>Your upcoming sessions</h2>
            <span className="pill pill-accepted">{accepted.length}</span>
          </div>
          <div className="timeline">
            {accepted.map((w, idx) => (
              <div key={w.id} className="timeline-item" style={{ animationDelay: `${idx * 0.07}s` }}>
                <div className="timeline-dot timeline-dot--accepted" />
                <div className="timeline-card timeline-card--accepted">
                  <div className="timeline-card-top">
                    <div>
                      <div className="timeline-card-name">{w.workshop_type.name}</div>
                      <div className="timeline-card-meta">
                        <span className="timeline-date-badge accepted">{w.date}</span>
                        <span className="timeline-days-away accepted">{daysUntil(w.date)}</span>
                      </div>
                      <div className="timeline-card-sub">
                        <Link to={`/users/${w.coordinator.id}`} className="inline-link">{w.coordinator.name}</Link>
                      </div>
                    </div>
                    <span className="pill pill-accepted">Confirmed</span>
                  </div>
                  <div className="timeline-actions">
                    <Link to={`/workshops/${w.id}`} className="btn btn-ghost btn-sm">Discussion</Link>
                    <button
                      type="button" className="btn btn-ghost btn-sm"
                      disabled={busy === w.id} onClick={() => bumpDate(w.id, w.date)}
                    >
                      Move date
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!fetching && rows.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-faint)" strokeWidth="1.4">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <p>No pending workshops right now.</p>
            <p style={{ fontSize: '0.88rem' }}>New proposals from coordinators will appear here.</p>
          </div>
        </div>
      )}

      {/* Scoped styles */}
      <style>{`
        .timeline { display: flex; flex-direction: column; gap: 0; position: relative; }
        .timeline::before {
          content: ''; position: absolute; left: 0.55rem; top: 0.6rem; bottom: 0;
          width: 1.5px; background: var(--c-line); z-index: 0;
        }
        .timeline-item {
          display: flex; gap: 1rem; align-items: flex-start;
          padding-bottom: 1rem; position: relative;
          animation: fadeUp 0.35s var(--ease) both;
        }
        .timeline-dot {
          width: 1.1rem; height: 1.1rem; border-radius: 50%; flex-shrink: 0;
          margin-top: 0.8rem; position: relative; z-index: 1;
          border: 2.5px solid var(--c-card);
          box-shadow: 0 0 0 2px var(--c-line);
          transition: box-shadow 0.2s, transform 0.2s var(--ease-back);
        }
        .timeline-item:hover .timeline-dot { transform: scale(1.25); }
        .timeline-dot--pending { background: var(--c-accent); box-shadow: 0 0 0 2px var(--c-accent); }
        .timeline-dot--accepted { background: var(--c-ok); box-shadow: 0 0 0 2px var(--c-ok); }
        .timeline-card {
          flex: 1; background: var(--c-card); border: 1px solid var(--c-line);
          border-radius: var(--r); padding: 0.9rem 1rem;
          box-shadow: var(--sh-xs);
          transition: transform 0.2s var(--ease), box-shadow 0.2s, border-color 0.2s;
        }
        .timeline-card--accepted { border-color: rgba(26,92,52,0.2); }
        @media (hover: hover) {
          .timeline-card:hover { transform: translateX(3px); box-shadow: var(--sh-sm); }
        }
        .timeline-card-top {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;
          margin-bottom: 0.65rem;
        }
        .timeline-card-name {
          font-weight: 700; font-size: 0.98rem; line-height: 1.3; margin-bottom: 0.25rem;
          font-family: var(--font-head);
        }
        .timeline-card-meta { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
        .timeline-date-badge {
          font-size: 0.75rem; font-weight: 600; color: var(--c-muted);
          background: var(--c-brand-lt); padding: 0.12rem 0.45rem;
          border-radius: 4px; letter-spacing: 0.02em;
        }
        .timeline-date-badge.accepted { background: var(--c-ok-lt); color: var(--c-ok); }
        .timeline-days-away {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 0.12rem 0.45rem; border-radius: 4px;
        }
        .timeline-days-away.pending { background: var(--c-accent-lt); color: var(--c-warn); }
        .timeline-days-away.accepted { background: var(--c-ok-lt); color: var(--c-ok); }
        .timeline-card-sub { font-size: 0.82rem; color: var(--c-muted); margin-top: 0.2rem; }
        .timeline-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
      `}</style>
    </Layout>
  )
}
