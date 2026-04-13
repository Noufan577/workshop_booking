import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

export function TypeDetailPage() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const [wt, setWt] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    apiFetch(`/workshop-types/${id}/`)
      .then(setWt)
      .catch(e => setErr(e.message))
  }, [id])

  useEffect(() => {
    if (wt?.name) document.title = `${wt.name} · FOSSEE`
  }, [wt])

  if (loading) return (
    <Layout>
      <div className="skeleton sk-line wide" style={{ marginBottom: '0.5rem' }} />
      <div className="skeleton sk-line short" style={{ marginBottom: '1.5rem' }} />
      <div className="skeleton sk-block" />
    </Layout>
  )
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />

  if (err || !wt) return (
    <Layout>
      <div className="banner err">{err || 'Workshop type not found.'}</div>
      <Link to="/types" className="btn btn-ghost btn-sm">← Back to catalogue</Link>
    </Layout>
  )

  const attachments = wt.attachments || []

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
        <Link to="/types" className="muted">Workshop catalogue</Link>
        <span className="muted"> / </span>
        <span>{wt.name}</span>
      </nav>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, flex: 1 }}>{wt.name}</h1>
          <span className="pill pill-brand">{wt.duration} day{wt.duration === 1 ? '' : 's'}</span>
        </div>
        <p className="lede" style={{ marginTop: '0.5rem' }}>{wt.description}</p>
      </div>

      {/* Downloads */}
      {attachments.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
            📎 Downloads & materials
          </h2>
          <ul className="stack-list">
            {attachments.map(a => (
              <li key={a.id} style={{ padding: '0.5rem 0' }}>
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-link">
                    {a.filename || 'Download file'}
                  </a>
                ) : (
                  <span className="muted">{a.filename}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Terms */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
          Terms &amp; conditions
        </h2>
        <div style={{
          whiteSpace: 'pre-wrap', fontSize: '0.92rem', lineHeight: 1.65,
          background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem', border: '1px solid var(--line)',
          maxHeight: '18rem', overflowY: 'auto',
        }}>
          {wt.terms_and_conditions}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {!user.is_instructor ? (
          <Link className="btn btn-primary" to="/propose">
            Propose this workshop →
          </Link>
        ) : (
          <Link className="btn btn-primary" to={`/types/${wt.id}/edit`}>
            Edit materials &amp; terms
          </Link>
        )}
        <Link to="/types" className="btn btn-ghost">← Back to catalogue</Link>
      </div>
    </Layout>
  )
}
