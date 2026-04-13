import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1rem',
        background: 'var(--bg)',
      }}>
        {/* Animated logo mark */}
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--brand) 0%, #0b3f3b 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(13,79,74,0.3)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5h-4v5H5a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand)' }}>
            FOSSEE Workshops
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--faint)', marginTop: '0.15rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            IIT Bombay
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '0.5rem', height: '0.5rem', borderRadius: '50%',
              background: 'var(--brand)', opacity: 0.3,
              animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.has_profile && user.profile && !user.profile.email_verified) return <Navigate to="/register" replace />
  if (user.is_superuser) { window.location.href = '/admin'; return null }

  if (!user.has_profile) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '24rem', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.75rem' }}>
          FOSSEE Workshops
        </div>
        <div className="banner warn">
          Your account has no workshop profile linked yet.
          Ask a site administrator to link your profile, or use the Django admin if you manage the server.
        </div>
      </div>
    </div>
  )

  if (user.is_instructor) return <Navigate to="/dashboard" replace />
  return <Navigate to="/status" replace />
}
