import { createContext, useContext, useState } from 'react'

interface Settings {
  language: string
  dateFormat: string
  exportFormat: string
  notifyEmail: boolean
  notifyNew: boolean
  notifyReport: boolean
  compactView: boolean
}

interface SettingsContextType {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

const STORAGE_KEY = 'siapesq_settings'

const defaults: Settings = {
  language: 'pt-BR',
  dateFormat: 'DD/MM/AAAA',
  exportFormat: 'CSV',
  notifyEmail: true,
  notifyNew: true,
  notifyReport: false,
  compactView: false,
}

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaults,
  update: () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load)

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
