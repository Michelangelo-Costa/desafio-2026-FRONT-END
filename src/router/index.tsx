import { createBrowserRouter } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { Dashboard } from '../pages/Dashboard'
import { SpeciesList } from '../pages/SpeciesList'
import { SpeciesDetail } from '../pages/SpeciesDetail'
import { SpeciesCreate } from '../pages/SpeciesCreate'
import { MapPage } from '../pages/MapPage'
import { SettingsPage } from '../pages/SettingsPage'
import { NotFound } from '../pages/NotFound'
import { Login } from '../pages/Login'
import { ProfilePage } from '../pages/ProfilePage'

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    ),
  },
  {
    path: '/species',
    element: (
      <AppLayout>
        <SpeciesList />
      </AppLayout>
    ),
  },
  {
    path: '/species/new',
    element: (
      <AppLayout>
        <SpeciesCreate />
      </AppLayout>
    ),
  },
  {
    path: '/species/:id',
    element: (
      <AppLayout>
        <SpeciesDetail />
      </AppLayout>
    ),
  },
  {
    path: '/map',
    element: (
      <AppLayout>
        <MapPage />
      </AppLayout>
    ),
  },
  {
    path: '/settings',
    element: (
      <AppLayout>
        <SettingsPage />
      </AppLayout>
    ),
  },
  {
    path: '/profile',
    element: (
      <AppLayout>
        <ProfilePage />
      </AppLayout>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
