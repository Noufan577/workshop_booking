import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

function initials(name) {
  return (name || '').split(' ').map(p => p.charAt(0)).join('').slice(0, 2).toUpperCase() || '?'
}

export function CoordinatorPublicPage() {
  const { userId } = useParams()
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!user?.is_instructor) return
    apiFetch(`/coordinators/${userId}/`)
      .then(setData)
      .catch(e => setErr(e.message))
  }, [user, userId])

  useEffect(() => {
    if (data?.profile?.name) document.title = `${data.profile.name} · FOSSEE`
  }, [data])

  if (loading) return (
    <Layout>
      <div className="skeleton sk-line wide" /><div className="skeleton sk-block" />
    </Layout>
  )
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (!user.is_instructor) return <Navigate to="/status" replace />
  if (err || !data) return (
    <Layout>
      <div className="banner err">{err || 'Coordinator not found.'}</div>
      <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to inbox</Link>
    </Layout>
  )

  const p = data.profile

  return (
    <Layout>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard" className="muted text-sm inline-link">← Back to inbox</Link>
      </div>


      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="avatar avatar-lg">{initials(p.name)}</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>{p.name}</h1>
            <div className="muted text-sm" style={{ marginTop: '0.25rem' }}>{p.institute}</div>
          </div>
        </div>

        <hr className="divider" />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="pill pill-brand">{p.department}</span>
          <span className="pill pill-brand">{p.state}</span>
        </div>

        <div style={{ marginTop: '0.85rem', fontSize: '0.92rem' }}>
          <strong>Phone:</strong>{' '}
          <a href={`tel:${p.phone_number}`} className="inline-link">{p.phone_number}</a>
        </div>
      </div>

      {/* Workshops */}
      <div className="section-head">
        <h2>Workshops with this coordinator</h2>
        <span className="pill pill-brand">{data.workshops.length}</span>
      </div>

      {data.workshops.length === 0 ? (
        <div className="card">
          <div className="empty-state"><p>No workshops yet.</p></div>
        </div>
      ) : (
        <ul className="card stack-list" style={{ padding: '0 1.2rem' }}>
          {data.workshops.map(w => (
            <li key={w.id}>
              <div className="ws-row">
                <div className="ws-row-info">
                  <Link to={`/workshops/${w.id}`} style={{ fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                    {w.workshop_type.name}
                  </Link>
                  <div className="ws-row-meta">{w.date}</div>
                </div>
                <span className={
                  w.status === 1 ? 'pill pill-accepted' :
                  w.status === 2 ? 'pill pill-deleted' : 'pill pill-pending'
                }>
                  {w.status_label}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
