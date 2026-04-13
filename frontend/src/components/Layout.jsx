import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import fosseeLogoUrl from '../assets/image.png'


function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-5.5h-6V21H4a1 1 0 0 1-1-1V11.5z" strokeLinejoin="round" />
    </svg>
  )
}
function IconList() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  )
}
function IconStats() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M4 20h16M6 20V14m4 6V9m4 11V5m4 15v-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Layout({ children, showNav = true }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isInstructor = user?.is_instructor
  const homeTo = isInstructor ? '/dashboard' : '/status'
  const loggedIn = !!(user?.profile)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="shell-header">
        {/* Brand mark with icon */}
        <Link to="/" className="brand-mark">
          <div className="brand-mark-icon" aria-hidden="true">
            <img src={fosseeLogoUrl} alt="FOSSEE logo" style={{ width: '1.5rem', height: '1.5rem', objectFit: 'contain', borderRadius: '4px' }} />
          </div>
          <div className="brand-mark-text">
            <strong>FOSSEE Workshops</strong>
            <span>IIT Bombay</span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {loggedIn ? (
            <>
              <Link to={homeTo}>Home</Link>
              <Link to="/statistics">Statistics</Link>
              {isInstructor && <Link to="/statistics/team">Team</Link>}
              <Link to="/types">Catalogue</Link>
              {!isInstructor && <Link to="/propose">Propose</Link>}
              <Link to="/profile">Profile</Link>
              {user?.is_superuser && <a href="/admin">Admin ↗</a>}
              <button type="button" className="nav-logout" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
          )}
        </nav>
      </header>

      <main id="main" className="shell-main" tabIndex={-1}>
        {children}
      </main>

      <footer className="shell-footer">
        FOSSEE · IIT Bombay ·{' '}
        <a href="https://fossee.in" target="_blank" rel="noopener noreferrer">fossee.in</a>
        {' '}· Open source for India
      </footer>

      {/* Bottom nav (mobile only) */}
      {showNav && loggedIn && (
        <nav className="bottom-nav" aria-label="Mobile navigation">
          <NavLink to={homeTo} end>
            <IconHome />
            Home
          </NavLink>
          <NavLink to="/statistics">
            <IconStats />
            Stats
          </NavLink>
          <NavLink to="/types">
            <IconList />
            Types
          </NavLink>
          {!isInstructor && (
            <NavLink to="/propose">
              <IconPlus />
              Propose
            </NavLink>
          )}
          <NavLink to="/profile">
            <IconUser />
            Profile
          </NavLink>
        </nav>
      )}
    </div>
  )
}
