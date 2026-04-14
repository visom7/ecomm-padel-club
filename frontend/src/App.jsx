import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import PlayerSelectPage from './pages/PlayerSelectPage'
import MatchdaysPage from './pages/MatchdaysPage'
import MatchdayDetailPage from './pages/MatchdayDetailPage'
import MatchdayFormPage from './pages/MatchdayFormPage'
import PlayedMatchesPage from './pages/PlayedMatchesPage'
import ResultFormPage from './pages/ResultFormPage'
import Layout from './components/Layout'

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlayerSelectPage />} />
          <Route element={<Layout />}>
            <Route path="/matchdays" element={<MatchdaysPage />} />
            <Route path="/matchdays/new" element={<MatchdayFormPage />} />
            <Route path="/matchdays/:id" element={<MatchdayDetailPage />} />
            <Route path="/matchdays/:id/edit" element={<MatchdayFormPage />} />
            <Route path="/matchdays/:id/result" element={<ResultFormPage />} />
            <Route path="/played" element={<PlayedMatchesPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
