import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

export function StatsTeamPage() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    document.title = 'Team Statistics · FOSSEE'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Compare workshop counts across instructors in your FOSSEE team.')
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user?.profile?.email_verified) return
    const path = teamId ? `/stats/team/${teamId}/` : '/stats/team/'
    setErr(null)
    apiFetch(path)
      .then(setData)
      .catch(e => {
        if (e.status === 401) setErr('auth')
        else if (e.status === 403) setErr('forbidden')
        else setErr(e.message || 'Failed to load')
      })
  }, [user, loading, teamId])

  if (loading) return (
    <Layout>
      <div className="skeleton sk-line wide" /><div className="skeleton sk-block" />
    </Layout>
  )
  if (!user?.profile?.email_verified) return <Navigate to="/login" replace />
  if (!user.is_instructor) return <Navigate to="/statistics" replace />
  if (err === 'auth') return <Navigate to="/login" replace />

  if (err === 'forbidden') return (
    <Layout>
      <div className="banner err">You are not on this team.</div>
      <Link to="/dashboard" className="btn btn-ghost btn-sm">← Back to inbox</Link>
    </Layout>
  )
  if (err) return (
    <Layout>
      <div className="banner err">{err}</div>
    </Layout>
  )
  if (!data) return (
    <Layout>
      <div className="skeleton sk-line wide" /><div className="skeleton sk-block" />
    </Layout>
  )
  if (data.empty) return (
    <Layout>
      <Link to="/statistics" className="muted text-sm inline-link">← Public statistics</Link>
      <h1 style={{ marginTop: '0.5rem' }}>Team statistics</h1>
      <p className="muted">{data.message}</p>
    </Layout>
  )

  const chartRows = (data.chart?.labels || []).map((name, i) => ({
    name, workshops: data.chart.counts[i] ?? 0,
  }))

  const topInstructor = chartRows.reduce((best, r) => r.workshops > (best?.workshops || 0) ? r : best, null)

  return (
    <Layout>
      <div style={{ marginBottom: '0.85rem' }}>
        <Link to="/statistics" className="muted text-sm inline-link">← Public statistics</Link>
      </div>

      <div className="page-header">
        <h1>Team comparison</h1>
        <p className="lede">Workshops taught per instructor in the selected team (all-time counts).</p>
      </div>

      {/* Team selector */}
      {data.teams?.length > 1 && (
        <div className="field" style={{ maxWidth: '18rem', marginBottom: '1.25rem' }}>
          <label htmlFor="team-sel">Select team</label>
          <select id="team-sel" value={data.current_team_id}
            onChange={e => { const v = e.target.value; navigate(v ? `/statistics/team/${v}` : '/statistics/team') }}>
            {data.teams.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      )}

      {/* Top performer highlight */}
      {topInstructor && (
        <div style={{
          background: 'linear-gradient(135deg, #c05c1f 0%, #a04810 100%)',
          borderRadius: 'var(--radius)', padding: '1rem 1.2rem', marginBottom: '1.25rem', color: '#fff',
        }}>
          <div className="text-xs" style={{ opacity: 0.75, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Top performer
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
            {topInstructor.name}
          </div>
          <div style={{ opacity: 0.85, fontSize: '0.9rem' }}>
            {topInstructor.workshops} workshop{topInstructor.workshops !== 1 ? 's' : ''} conducted
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '0.75rem 0.5rem' }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.88rem' }} />
            <Bar dataKey="workshops" fill="#c05c1f" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  )
}
