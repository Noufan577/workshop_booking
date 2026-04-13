import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

export function AddTypePage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ name: '', description: '', duration: 1, terms_and_conditions: '' })
  const [err, setErr] = useState(null)
  const [pending, setPending] = useState(false)

  useEffect(() => { document.title = 'New Workshop Type · FOSSEE' }, [])

  if (loading) return <Layout><div className="skeleton sk-block" /></Layout>
  if (!user?.profile?.email_verified || !user.is_instructor) return <Navigate to="/types" replace />

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function onSubmit(e) {
    e.preventDefault(); setPending(true); setErr(null)
    try {
      const res = await apiFetch('/workshop-types/create/', {
        method: 'POST',
        body: JSON.stringify({ ...form, duration: Number(form.duration) }),
      })
      navigate(`/types/${res.id}`)
    } catch (ex) {
      setErr(ex.body?.errors ? JSON.stringify(ex.body.errors) : ex.message)
    } finally { setPending(false) }
  }

  const charCount = form.name.length
  const descCount = form.description.length

  return (
    <Layout>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
        <Link to="/types" className="muted">Workshop catalogue</Link>
        <span className="muted"> / </span>
        <span>New type</span>
      </nav>

      <div className="page-header">
        <h1>Define a workshop type</h1>
        <p className="lede">
          This template will be visible to all coordinators. Keep the wording clear and honest — they will use it to set student expectations.
        </p>
      </div>

      {err && <div className="banner err" role="alert">{err}</div>}

      <form className="card" onSubmit={onSubmit}>
        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="wn">Workshop name</label>
            <span className="text-xs muted">{charCount}/120</span>
          </div>
          <input
            id="wn" value={form.name} maxLength={120} required
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Python for Engineering"
            style={{ fontSize: '1.1rem', fontWeight: 500 }}
          />
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="wd">Description</label>
            <span className="text-xs muted">{descCount} chars</span>
          </div>
          <textarea
            id="wd" rows={5} value={form.description} required
            onChange={e => set('description', e.target.value)}
            placeholder="What will participants learn? What tools are used?"
          />
        </div>

        <div className="field" style={{ maxWidth: '10rem' }}>
          <label htmlFor="wdu">Duration (days)</label>
          <input
            id="wdu" type="number" min={1} max={30} required
            value={form.duration} onChange={e => set('duration', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="wt">Terms &amp; conditions</label>
          <textarea
            id="wt" rows={7} value={form.terms_and_conditions} required
            onChange={e => set('terms_and_conditions', e.target.value)}
            placeholder="List what coordinators must agree to before proposing this workshop…"
          />
          <span className="field-hint">Participants will read this before submitting a proposal.</span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to="/types" className="btn btn-ghost" style={{ flex: 1 }}>Cancel</Link>
          <button className="btn btn-primary" type="submit" disabled={pending} style={{ flex: 2 }}>
            {pending ? 'Publishing…' : 'Publish type →'}
          </button>
        </div>
      </form>
    </Layout>
  )
}
