import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ThemeProvider } from './contexts/ThemeContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { UserProvider } from './contexts/UserContext'

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
