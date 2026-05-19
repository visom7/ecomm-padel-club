import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { CompetitionsProvider } from './context/CompetitionsContext'
import PlayerSelectPage from './pages/PlayerSelectPage'
import MatchdaysPage from './pages/MatchdaysPage'
import MatchdayDetailPage from './pages/MatchdayDetailPage'
import MatchdayFormPage from './pages/MatchdayFormPage'
import PlayedMatchesPage from './pages/PlayedMatchesPage'
import ResultFormPage from './pages/ResultFormPage'
import LiveListPage from './pages/LiveListPage'
import LiveScorePage from './pages/LiveScorePage'
import AdminPage from './pages/AdminPage'
import CompetitionFormPage from './pages/CompetitionFormPage'
import CompetitionStatsPage from './pages/CompetitionStatsPage'
import PlayerStatsPage from './pages/PlayerStatsPage'
import BeerRoundsPage from './pages/BeerRoundsPage'
import Layout from './components/Layout'

export default function App() {
  return (
    <SessionProvider>
      <CompetitionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PlayerSelectPage />} />
            <Route element={<Layout />}>
              <Route path="/matchdays" element={<MatchdaysPage />} />
              <Route path="/matchdays/new" element={<MatchdayFormPage />} />
              <Route path="/matchdays/:id" element={<MatchdayDetailPage />} />
              <Route path="/matchdays/:id/edit" element={<MatchdayFormPage />} />
              <Route path="/matchdays/:id/result" element={<ResultFormPage />} />
              <Route path="/live" element={<LiveListPage />} />
              <Route path="/live/:id" element={<LiveScorePage />} />
              <Route path="/played" element={<PlayedMatchesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/competitions/new" element={<CompetitionFormPage />} />
              <Route path="/admin/competitions/:id/edit" element={<CompetitionFormPage />} />
              <Route path="/admin/competitions/:id/stats" element={<CompetitionStatsPage />} />
              <Route path="/players/stats" element={<PlayerStatsPage />} />
              <Route path="/cubos" element={<BeerRoundsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </CompetitionsProvider>
    </SessionProvider>
  )
}
