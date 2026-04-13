import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { apiFetch, apiUpload } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

export function TypeEditPage() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ name: '', description: '', duration: 1, terms_and_conditions: '' })
  const [attachments, setAttachments] = useState([])
  const [err, setErr] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)
  const [loadErr, setLoadErr] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { document.title = 'Edit Workshop Type · FOSSEE' }, [])

  useEffect(() => {
    apiFetch(`/workshop-types/${id}/`)
      .then(data => {
        setForm({
          name: data.name || '', description: data.description || '',
          duration: data.duration ?? 1, terms_and_conditions: data.terms_and_conditions || '',
        })
        setAttachments(data.attachments || [])
      })
      .catch(e => setLoadErr(e.message))
  }, [id])

  if (loading) return <Layout><div className="skeleton sk-block" /></Layout>
  if (!user?.profile?.email_verified || !user.is_instructor) return <Navigate to={`/types/${id}`} replace />
  if (loadErr) return (
    <Layout>
      <div className="banner err">{loadErr}</div>
      <Link to="/types" className="btn btn-ghost btn-sm">← Catalogue</Link>
    </Layout>
  )

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault(); setPending(true); setErr(null); setSaved(false)
    try {
      await apiFetch(`/workshop-types/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ ...form, duration: Number(form.duration) }),
      })
      const data = await apiFetch(`/workshop-types/${id}/`)
      setAttachments(data.attachments || [])
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (ex) {
      setErr(ex.body?.errors ? JSON.stringify(ex.body.errors) : ex.message)
    } finally { setPending(false) }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    setUploading(true); setErr(null)
    try {
      const fd = new FormData(); fd.append('attachments', file)
      const res = await apiUpload(`/workshop-types/${id}/attachments/`, fd)
      if (res.attachment) setAttachments(prev => [...prev, res.attachment])
    } catch (ex) { setErr(ex.message) } finally { setUploading(false) }
  }

  async function removeFile(attId) {
    if (!window.confirm('Remove this file?')) return
    setErr(null)
    try {
      await apiFetch(`/attachments/${attId}/`, { method: 'DELETE' })
      setAttachments(prev => prev.filter(a => a.id !== attId))
    } catch (ex) { setErr(ex.message) }
  }

  return (
    <Layout>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
        <Link to="/types" className="muted">Catalogue</Link>
        <span className="muted"> / </span>
        <Link to={`/types/${id}`} className="muted">{form.name || 'Type'}</Link>
        <span className="muted"> / </span>
        <span>Edit</span>
      </nav>

      <div className="page-header">
        <h1>Edit workshop type</h1>
        <p className="lede">
          Update the details coordinators see when proposing. Upload schedules or instructions one file at a time.
        </p>
      </div>

      {err && <div className="banner err" role="alert">{err}</div>}
      {saved && <div className="banner ok" role="status">Changes saved successfully ✓</div>}

      <form className="card" onSubmit={onSubmit} style={{ marginBottom: '1rem' }}>
        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="wen">Name</label>
            <span className="text-xs muted">{form.name.length}/120</span>
          </div>
          <input id="wen" value={form.name} maxLength={120} onChange={e => set('name', e.target.value)}
            style={{ fontSize: '1.1rem', fontWeight: 500 }} required />
        </div>

        <div className="field">
          <label htmlFor="wed">Description</label>
          <textarea id="wed" rows={5} value={form.description} onChange={e => set('description', e.target.value)} required />
        </div>

        <div className="field" style={{ maxWidth: '10rem' }}>
          <label htmlFor="wedu">Duration (days)</label>
          <input id="wedu" type="number" min={1} value={form.duration} onChange={e => set('duration', e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="wet">Terms &amp; conditions</label>
          <textarea id="wet" rows={7} value={form.terms_and_conditions} onChange={e => set('terms_and_conditions', e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to={`/types/${id}`} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</Link>
          <button className="btn btn-primary" type="submit" disabled={pending} style={{ flex: 2 }}>
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Attachments */}
      <div className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
          📎 Attachments
        </h2>
        <p className="muted text-sm" style={{ marginBottom: '1rem' }}>
          PDFs, schedules, or instructions. Participants can download these from the type page.
        </p>

        <div className="field" style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="file-up">Upload a file</label>
          <input id="file-up" type="file" onChange={onUpload} disabled={uploading} />
        </div>
        {uploading && <p className="muted text-sm">Uploading…</p>}

        {attachments.length === 0 ? (
          <p className="muted text-sm">No attachments yet.</p>
        ) : (
          <ul className="stack-list">
            {attachments.map(a => (
              <li key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="inline-link text-sm">
                    📄 {a.filename || 'File'}
                  </a>
                ) : (
                  <span className="text-sm">{a.filename}</span>
                )}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFile(a.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
