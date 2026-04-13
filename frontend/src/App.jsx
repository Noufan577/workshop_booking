import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AddTypePage } from './pages/AddTypePage'
import { CoordinatorPublicPage } from './pages/CoordinatorPublicPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProposePage } from './pages/ProposePage'
import { RegisterPage } from './pages/RegisterPage'
import { RootRedirect } from './pages/RootRedirect'
import { StatusPage } from './pages/StatusPage'
import { TypeDetailPage } from './pages/TypeDetailPage'
import { TypeEditPage } from './pages/TypeEditPage'
import { TypesPage } from './pages/TypesPage'
import { WorkshopDetailPage } from './pages/WorkshopDetailPage'
import { StatsPublicPage } from './pages/StatsPublicPage'
import { StatsTeamPage } from './pages/StatsTeamPage'

const basename = import.meta.env.MODE === 'development' ? '/static/workshop_app/react/' : '/workshop/app'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/types" element={<TypesPage />} />
          <Route path="/types/new" element={<AddTypePage />} />
          <Route path="/types/:id/edit" element={<TypeEditPage />} />
          <Route path="/types/:id" element={<TypeDetailPage />} />
          <Route path="/propose" element={<ProposePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
          <Route path="/users/:userId" element={<CoordinatorPublicPage />} />
          <Route path="/statistics/team/:teamId" element={<StatsTeamPage />} />
          <Route path="/statistics/team" element={<StatsTeamPage />} />
          <Route path="/statistics" element={<StatsPublicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
