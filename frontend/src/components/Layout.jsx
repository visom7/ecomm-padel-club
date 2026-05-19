import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import { useSession } from '../context/SessionContext'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Layout() {
  const { session } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) navigate('/')
  }, [session, navigate])

  if (!session) return null

  return (
    <div className="flex flex-col min-h-screen bg-daylight-cream">
      <Header />
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
