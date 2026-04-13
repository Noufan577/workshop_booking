import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

/* 3D tilt card using CSS perspective */
function TypeCard({ t, isInstructor, idx }) {
  const ref = useRef(null)

  function onMouseMove(e) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 12
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -12
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-5px)`
    el.style.boxShadow = `${-x * 0.5}px ${y * 0.5 + 12}px 32px rgba(27,35,64,0.18), 0 4px 16px rgba(247,163,91,0.2)`
  }

  function onMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.boxShadow = ''
  }

  const colorIndex = idx % 4
  const accentColors = [
    'rgba(247,163,91,0.12)',   // amber tint
    'rgba(27,35,64,0.05)',     // navy tint
    'rgba(26,92,52,0.07)',     // green tint
    'rgba(139,26,26,0.05)',    // red tint
  ]
  const borderColors = ['var(--amber)', 'var(--navy)', 'var(--ok)', 'var(--err)']

  return (
    <div
      ref={ref}
      className="type-card"
      style={{
        animationDelay: `${idx * 0.06}s`,
        '--card-accent-bg': accentColors[colorIndex],
        '--card-border-color': borderColors[colorIndex],
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >

      <div className="type-card-watermark" aria-hidden="true">
        {t.duration}
      </div>


      <div className="type-card-top">
        <span className="type-card-badge">
          {t.duration === 1 ? '1 day' : `${t.duration} days`}
        </span>
        <span className="type-card-id">#{t.id}</span>
      </div>


      <Link to={`/types/${t.id}`} className="type-card-title">
        {t.name}
      </Link>


      <p className="type-card-desc">
        {t.description.length > 90
          ? t.description.slice(0, 90) + '…'
          : t.description}
      </p>


      <div className="type-card-rule" />


      <div className="type-card-actions">
        <Link to={`/types/${t.id}`} className="btn btn-primary btn-sm">
          View details →
        </Link>
        {!isInstructor && (
          <Link to="/propose" className="btn btn-ghost btn-sm">Propose</Link>
        )}
        {isInstructor && (
          <Link to={`/types/${t.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
        )}
      </div>
    </div>
  )
}

export function TypesPage() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => { document.title = 'Workshop Catalogue · FOSSEE' }, [])

  useEffect(() => {
    apiFetch(`/workshop-types/?page=${page}&per_page=20`)
      .then(setData)
      .catch(e => setErr(e.message))
  }, [page])

  if (loading) return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 17rem), 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ height: '11rem', borderRadius: '14px' }} />
        ))}
      </div>
    </Layout>
  )
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.per_page)) : 1
  const visible = (data?.results || []).filter(t =>
    !filter
    || t.name.toLowerCase().includes(filter.toLowerCase())
    || t.description.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <Layout>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h1>Workshop Catalogue</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Browse and propose from our standardised workshop templates.
          </p>
        </div>
        {user.is_instructor && (
          <Link to="/types/new" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
            + New type
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)', pointerEvents: 'none' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="type-filter" value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search workshops…"
          style={{ paddingLeft: '2.5rem', paddingRight: filter ? '2.5rem' : undefined, borderRadius: '999px', background: 'var(--card)' }}
          aria-label="Filter workshop types"
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            aria-label="Clear"
            style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', fontSize: '1.15rem', lineHeight: 1, padding: 0 }}
          >×</button>
        )}
      </div>

      {err && <div className="banner err" role="alert">{err}</div>}

      {/* Loading skeletons */}
      {!data && !err && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 17rem), 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '11rem', borderRadius: '14px' }} />)}
        </div>
      )}

      {/* Empty */}
      {visible.length === 0 && data && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
          <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>No matches for "{filter}"</p>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilter('')}>Clear search</button>
        </div>
      )}

      {/* Card grid */}
      <div className="types-grid">
        {visible.map((t, idx) => (
          <TypeCard key={t.id} t={t} isInstructor={user.is_instructor} idx={idx} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      <style>{`
        .types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
          gap: 1rem;
        }
        .type-card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 1.15rem 1.2rem 1rem;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; gap: 0.5rem;
          box-shadow: var(--sh-xs);
          animation: cardIn 0.4s var(--ease) both;
          transition: transform 0.22s var(--ease), box-shadow 0.22s;
          cursor: default;
          /* Subtle top border in brand color */
          border-top: 3px solid var(--card-border-color, var(--line));
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }
        /* Colored background tint from card accent */
        .type-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: 14px;
          background: var(--card-accent-bg, transparent);
          pointer-events: none;
        }
        /* Large watermark number */
        .type-card-watermark {
          position: absolute; right: 0.75rem; bottom: -0.75rem;
          font-family: var(--font-head); font-size: 6rem; font-weight: 900;
          line-height: 1; color: rgba(27,35,64,0.05); user-select: none;
          pointer-events: none; letter-spacing: -0.04em;
          transition: color 0.3s;
        }
        .type-card:hover .type-card-watermark { color: rgba(27,35,64,0.09); }
        .type-card-top {
          display: flex; justify-content: space-between; align-items: center;
          position: relative;
        }
        .type-card-badge {
          font-size: 0.64rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 0.18rem 0.5rem; border-radius: 4px;
          background: var(--amber-lt); color: var(--warn);
        }
        .type-card-id { font-size: 0.68rem; color: var(--faint); font-weight: 600; }
        .type-card-title {
          font-family: var(--font-head); font-size: 1.05rem; font-weight: 700;
          color: var(--ink); text-decoration: none; line-height: 1.25;
          position: relative; transition: color 0.15s;
        }
        .type-card-title:hover { color: var(--navy); }
        .type-card-desc {
          font-size: 0.84rem; color: var(--muted); line-height: 1.55;
          flex: 1; margin: 0; position: relative;
        }
        .type-card-rule {
          height: 1px; background: var(--line); margin: 0.2rem 0;
          position: relative;
        }
        .type-card-actions {
          display: flex; gap: 0.4rem; position: relative;
          /* Always visible — no hover-reveal on mobile */
        }
        @media (hover: hover) {
          .type-card-actions {
            opacity: 0; transform: translateY(4px);
            transition: opacity 0.2s, transform 0.2s var(--ease);
          }
          .type-card:hover .type-card-actions { opacity: 1; transform: none; }
        }
      `}</style>
    </Layout>
  )
}
