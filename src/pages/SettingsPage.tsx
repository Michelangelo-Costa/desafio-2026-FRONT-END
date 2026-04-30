import { useState } from 'react'
import { Moon, Sun, Globe, Bell, Database, Shield } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-teal' : 'bg-siapesq-border'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-siapesq-border p-6 mb-4">
      <h2 className="flex items-center gap-2 font-bold text-navy text-sm mb-5">
        <Icon size={16} className="text-teal" />
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-siapesq-dark">{label}</p>
        {description && <p className="text-xs text-siapesq-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyNew, setNotifyNew] = useState(true)
  const [notifyReport, setNotifyReport] = useState(false)
  const [compactView, setCompactView] = useState(false)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">Configurações</h1>
        <p className="text-sm text-siapesq-muted mt-0.5">Preferências e configurações do sistema</p>
      </div>

      <Section icon={Sun} title="Aparência">
        <SettingRow label="Modo Escuro" description="Alterna entre tema claro e escuro">
          <div className="flex items-center gap-3">
            <Sun size={15} className="text-siapesq-muted" />
            <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
            <Moon size={15} className="text-siapesq-muted" />
          </div>
        </SettingRow>
        <div className="h-px bg-siapesq-border" />
        <SettingRow label="Visualização Compacta" description="Reduz o espaçamento nas listas de espécies">
          <Toggle enabled={compactView} onChange={setCompactView} />
        </SettingRow>
      </Section>

      <Section icon={Globe} title="Idioma e Região">
        <SettingRow label="Idioma do sistema" description="Idioma exibido na interface">
          <select className="rounded-xl border border-siapesq-border px-3 py-1.5 text-sm text-siapesq-dark bg-white focus:outline-none focus:border-teal">
            <option>Português (BR)</option>
            <option>English</option>
            <option>Español</option>
          </select>
        </SettingRow>
        <div className="h-px bg-siapesq-border" />
        <SettingRow label="Formato de data" description="Como as datas são exibidas no sistema">
          <select className="rounded-xl border border-siapesq-border px-3 py-1.5 text-sm text-siapesq-dark bg-white focus:outline-none focus:border-teal">
            <option>DD/MM/AAAA</option>
            <option>MM/DD/YYYY</option>
            <option>AAAA-MM-DD</option>
          </select>
        </SettingRow>
      </Section>

      <Section icon={Bell} title="Notificações">
        <SettingRow label="Notificações por e-mail" description="Receba atualizações importantes no seu e-mail">
          <Toggle enabled={notifyEmail} onChange={setNotifyEmail} />
        </SettingRow>
        <div className="h-px bg-siapesq-border" />
        <SettingRow label="Novas espécies cadastradas" description="Alerta quando outros pesquisadores adicionam espécies">
          <Toggle enabled={notifyNew} onChange={setNotifyNew} />
        </SettingRow>
        <div className="h-px bg-siapesq-border" />
        <SettingRow label="Relatórios semanais" description="Resumo semanal das atividades do sistema">
          <Toggle enabled={notifyReport} onChange={setNotifyReport} />
        </SettingRow>
      </Section>

      <Section icon={Database} title="Dados e Exportação">
        <SettingRow label="Formato de exportação padrão" description="Formato usado ao exportar dados de espécies">
          <select className="rounded-xl border border-siapesq-border px-3 py-1.5 text-sm text-siapesq-dark bg-white focus:outline-none focus:border-teal">
            <option>CSV</option>
            <option>JSON</option>
          </select>
        </SettingRow>
      </Section>

      <Section icon={Shield} title="Sobre">
        <SettingRow label="Versão do sistema" description="SIAPESQ Frontend">
          <span className="text-xs font-mono text-siapesq-muted bg-siapesq-surface px-2 py-1 rounded-lg border border-siapesq-border">
            v1.0.0
          </span>
        </SettingRow>
      </Section>
    </div>
  )
}
