import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { apiFetch } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'

function chartData(labels, counts) {
  if (!labels || !counts) return []
  return labels.map((name, i) => ({ name, value: counts[i] ?? 0 }))
}

export function StatsPublicPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [tab, setTab] = useState('state')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const queryString = useMemo(() => searchParams.toString(), [searchParams])
  const verified = user?.profile?.email_verified

  const load = useCallback(() => {
    setErr(null)
    const q = queryString ? `?${queryString}` : ''
    apiFetch(`/stats/public${q}`)
      .then(setData)
      .catch(e => setErr(e.message || 'Could not load statistics.'))
  }, [queryString])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    document.title = 'Workshop Statistics · FOSSEE · IIT Bombay'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta) }
    meta.setAttribute('content', 'Filter accepted FOSSEE workshops by date, state, and type. Export CSV for your records.')
  }, [])

  function onFilterSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const next = new URLSearchParams()
    const from = fd.get('from_date'), to = fd.get('to_date'), st = fd.get('state'), wt = fd.get('workshop_type'), sort = fd.get('sort')
    if (from) next.set('from_date', from)
    if (to) next.set('to_date', to)
    if (st) next.set('state', st)
    if (wt) next.set('workshop_type', wt)
    if (fd.get('show_workshops') === 'on') next.set('show_workshops', 'on')
    if (sort) next.set('sort', sort)
    setSearchParams(next)
    setFiltersOpen(false)
  }

  function clearFilters() { setSearchParams({}) }

  function downloadCsv() {
    const base = '/workshop/api/stats/public/'
    const qs = queryString ? `${queryString}&download=download` : 'download=download'
    window.location.href = base + '?' + qs
  }

  const stateChart = chartData(data?.chart_state?.labels, data?.chart_state?.counts)
  const typeChart  = chartData(data?.chart_type?.labels,  data?.chart_type?.counts)

  const totalCount = data?.pagination?.total_count || (data?.rows?.length ?? 0)

  return (
    <Layout showNav={!!verified}>
      <div className="page-header">
        <h1>Workshop Statistics</h1>
        <p className="lede">
          Accepted workshops across India. Filter by date, state, or type to narrow your view.
        </p>
      </div>

      {user?.is_instructor && (
        <p className="text-sm" style={{ marginBottom: '0.75rem' }}>
          <Link to="/statistics/team" className="inline-link">→ View team comparison (instructors)</Link>
        </p>
      )}

      {!verified && (
        <div className="banner warn">
          You are browsing as a guest — sign in to download CSV and filter by your workshops.{' '}
          <Link to="/login" className="inline-link">Sign in →</Link>
        </div>
      )}

      {err && <div className="banner err" role="alert">{err}</div>}

      {/* Summary strip */}
      {data && (
        <div style={{
          background: 'var(--brand-lt)', border: '1px solid rgba(15,92,85,0.2)',
          borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem',
          marginBottom: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand)', fontFamily: 'var(--font-display)' }}>
              {data.rows?.length ?? 0}
            </div>
            <div className="text-xs muted">workshops shown</div>
          </div>
          {data.filters?.from_date && (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--brand)' }}>{data.filters.from_date}</div>
              <div className="text-xs muted">from date</div>
            </div>
          )}
          {data.filters?.to_date && (
            <div>
              <div style={{ fontWeight: 600, color: 'var(--brand)' }}>{data.filters.to_date}</div>
              <div className="text-xs muted">to date</div>
            </div>
          )}
        </div>
      )}

      {/* Filter form — collapsible on mobile */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setFiltersOpen(v => !v)} role="button" aria-expanded={filtersOpen}>
          <h2 style={{ margin: 0, fontSize: '1rem' }}>Filters</h2>
          <span className="muted text-sm">{filtersOpen ? '▲ Hide' : '▼ Show'}</span>
        </div>

        {filtersOpen && (
          <form key={queryString} onSubmit={onFilterSubmit} style={{ marginTop: '1rem' }}>
            <h2 className="visually-hidden" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Filters</h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="f-from">From date</label>
                <input type="date" id="f-from" name="from_date" defaultValue={data?.filters?.from_date || ''} />
              </div>
              <div className="field">
                <label htmlFor="f-to">To date</label>
                <input type="date" id="f-to" name="to_date" defaultValue={data?.filters?.to_date || ''} />
              </div>
              <div className="field">
                <label htmlFor="f-wt">Workshop type</label>
                <select id="f-wt" name="workshop_type" defaultValue={data?.filters?.workshop_type || ''}>
                  <option value="">Any type</option>
                  {(data?.workshop_types || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-st">State</label>
                <select id="f-st" name="state" defaultValue={data?.filters?.state || ''}>
                  <option value="">Any state</option>
                  {(data?.states || []).map(s => <option key={s.value || 'blank'} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-sort">Sort by</label>
                <select id="f-sort" name="sort" defaultValue={data?.filters?.sort || 'date'}>
                  {(data?.sort_options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            {verified && (
              <div className="field">
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" name="show_workshops" defaultChecked={!!data?.filters?.show_workshops} />
                  Show only my workshops
                </label>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">Apply filters</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear all</button>
              {verified && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={downloadCsv}>↓ Download CSV</button>
              )}
            </div>
          </form>
        )}
      </div>

      {data && (
        <>
          {/* Chart tabs */}
          <div className="tab-group">
            <button type="button" className={`tab-btn ${tab === 'state' ? 'active' : ''}`} onClick={() => setTab('state')}>By state</button>
            <button type="button" className={`tab-btn ${tab === 'type' ? 'active' : ''}`} onClick={() => setTab('type')}>By type</button>
          </div>

          <div className="card" style={{ marginBottom: '1rem', padding: '0.75rem 0.5rem' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tab === 'state' ? stateChart : typeChart} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted)' }} interval={0} angle={-35} textAnchor="end" height={70} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.88rem' }} />
                <Bar dataKey="value" fill="var(--brand)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data table */}
          <div className="card data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Coordinator</th><th>Institute</th>
                  <th>Instructor</th><th>Workshop</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(data.rows || []).map((r, i) => (
                  <tr key={`${r.date}-${i}`}>
                    <td className="muted text-xs">{(data.pagination.page - 1) * data.pagination.per_page + i + 1}</td>
                    <td>{r.coordinator_name}</td>
                    <td className="muted text-sm">{r.institute}</td>
                    <td>{r.instructor_name}</td>
                    <td className="text-sm" style={{ fontWeight: 500 }}>{r.workshop_name}</td>
                    <td className="muted text-sm">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.num_pages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost btn-sm" disabled={!data.pagination.has_previous}
                onClick={() => { const p = new URLSearchParams(queryString); p.set('page', String(data.pagination.page - 1)); setSearchParams(p) }}>
                ← Prev
              </button>
              <span className="page-info">Page {data.pagination.page} / {data.pagination.num_pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={!data.pagination.has_next}
                onClick={() => { const p = new URLSearchParams(queryString); p.set('page', String(data.pagination.page + 1)); setSearchParams(p) }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
