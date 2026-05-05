import { createContext, useContext } from 'react'

export interface Settings {
  language: string
  dateFormat: string
  exportFormat: string
  notifyEmail: boolean
  notifyNew: boolean
  notifyReport: boolean
  compactView: boolean
}

export interface SettingsContextType {
  settings: Settings
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

export const defaultSettings: Settings = {
  language: 'pt-BR',
  dateFormat: 'DD/MM/AAAA',
  exportFormat: 'CSV',
  notifyEmail: true,
  notifyNew: true,
  notifyReport: false,
  compactView: false,
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  update: () => {},
})

export const useSettings = () => useContext(SettingsContext)
