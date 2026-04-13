import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

function statusBanner(status) {
  if (status === 1) return { label: 'Accepted', bg: 'var(--ok-lt)', color: 'var(--ok)', border: 'rgba(26,107,55,0.25)' }
  if (status === 2) return { label: 'Cancelled', bg: 'var(--err-lt)', color: 'var(--err)', border: 'rgba(154,28,28,0.25)' }
  return { label: 'Pending', bg: 'var(--warn-lt)', color: 'var(--warn)', border: 'rgba(146,80,26,0.25)' }
}

function initials(name) {
  return (name || '').split(' ').map(p => p.charAt(0)).join('').slice(0, 2).toUpperCase() || '?'
}

export function WorkshopDetailPage() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  const [comment, setComment] = useState('')
  const [pub, setPub] = useState(true)
  const [err, setErr] = useState(null)
  const [posting, setPosting] = useState(false)

  function load() {
    apiFetch(`/workshops/${id}/`)
      .then(setData)
      .catch(e => setErr(e.message))
  }

  useEffect(() => { load() }, [id])
  useEffect(() => {
    if (data?.workshop?.workshop_type?.name) {
      document.title = `${data.workshop.workshop_type.name} · Thread`
    }
  }, [data])

  if (loading) return (
    <Layout>
      <div className="skeleton sk-line wide" /><div className="skeleton sk-block" />
    </Layout>
  )
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (err || !data) return (
    <Layout>
      <div className="banner err">{err || 'Workshop not found.'}</div>
      <Link to="/" className="btn btn-ghost btn-sm">← Back</Link>
    </Layout>
  )

  const w = data.workshop
  const sb = statusBanner(w.status)
  const backTo = user.is_instructor ? '/dashboard' : '/status'

  async function sendComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setErr(null); setPosting(true)
    try {
      await apiFetch(`/workshops/${id}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ comment, public: pub }),
      })
      setComment('')
      load()
    } catch (ex) { setErr(ex.message) } finally { setPosting(false) }
  }

  return (
    <Layout>
      {/* Back link */}
      <div style={{ marginBottom: '0.75rem' }}>
        <Link to={backTo} className="muted text-sm inline-link">← Back</Link>
      </div>

      {/* Status banner */}
      <div style={{
        background: sb.bg, border: `1px solid ${sb.border}`, color: sb.color,
        borderRadius: 'var(--radius)', padding: '0.65rem 1rem',
        fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.85rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Status: {sb.label}</span>
        <span className="text-xs" style={{ fontWeight: 400, opacity: 0.8 }}>{w.date}</span>
      </div>

      <h1 style={{ marginBottom: '0.3rem' }}>{w.workshop_type.name}</h1>
      <p className="muted text-sm" style={{ marginBottom: '1.25rem' }}>
        Coordinator: <strong>{w.coordinator.name}</strong>
        {w.instructor ? ` · Instructor: ${w.instructor.name}` : ' · No instructor assigned yet'}
      </p>

      {/* Comments */}
      <div className="section-head"><h2>Discussion thread</h2></div>

      {data.comments.length === 0 ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="empty-state" style={{ padding: '1.25rem' }}>
            <p>No notes yet. Be the first to add one.</p>
          </div>
        </div>
      ) : (
        <div className="comment-list" style={{ marginBottom: '1.25rem' }}>
          {data.comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="avatar">{initials(c.author)}</div>
              <div className={`comment-body ${!c.public ? 'private' : ''}`}>
                <div>
                  <span className="comment-author">{c.author}</span>
                  <span className="comment-time">
                    {new Date(c.created_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  {!c.public && (
                    <span className="pill pill-pending" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Private</span>
                  )}
                </div>
                <div className="comment-text">{c.comment}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {err && <div className="banner err" role="alert">{err}</div>}

      {/* Add comment */}
      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem', marginBottom: '0.85rem' }}>Add a note</h2>
        <form onSubmit={sendComment}>
          {user.is_instructor && (
            <div className="field">
              <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox" checked={pub} onChange={e => setPub(e.target.checked)}
                  style={{ width: '1rem', height: '1rem' }}
                />
                <span>Visible to the coordinator (uncheck for private note)</span>
              </label>
            </div>
          )}
          <div className="field">
            <label htmlFor="cmt">Message</label>
            <textarea id="cmt" rows={4} value={comment} onChange={e => setComment(e.target.value)} required
              placeholder="Write your note here…" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={posting || !comment.trim()}>
            {posting ? 'Posting…' : 'Post note'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
