import { createHashRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Dashboard } from '../pages/Dashboard'
import { SpeciesList } from '../pages/SpeciesList'
import { SpeciesDetail } from '../pages/SpeciesDetail'
import { SpeciesCreate } from '../pages/SpeciesCreate'
import { MapPage } from '../pages/MapPage'
import { SettingsPage } from '../pages/SettingsPage'
import { NotFound } from '../pages/NotFound'
import { Login } from '../pages/Login'
import { Register } from '../pages/Register'
import { ForgotPassword } from '../pages/ForgotPassword'
import { ResetPassword } from '../pages/ResetPassword'
import { ProfilePage } from '../pages/ProfilePage'

export const router = createHashRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
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
