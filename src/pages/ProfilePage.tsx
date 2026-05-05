import { useState, useRef } from 'react'
import { Camera, Save, User, Mail, Shield, Calendar, Lock } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authService'

function decodeToken(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function ProfilePage() {
  const token = authService.getToken()
  const payload = token ? decodeToken(token) : null

  const [displayName, setDisplayName] = useState<string>(
    () => localStorage.getItem('siapesq_display_name') ?? payload?.name ?? 'Usuário'
  )
  const [avatar, setAvatar] = useState<string | null>(
    () => localStorage.getItem('siapesq_avatar')
  )
  const [saved, setSaved] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const email = payload?.email ?? '—'
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  const since = payload?.iat ? new Date(payload.iat * 1000).toLocaleDateString('pt-BR') : '—'

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatar(result)
      localStorage.setItem('siapesq_avatar', result)
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    localStorage.setItem('siapesq_display_name', displayName)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas nao conferem')
      return
    }

    setPasswordLoading(true)
    try {
      const result = await authService.changePassword(currentPassword, newPassword)
      setPasswordSuccess(result.message || 'Senha atualizada com sucesso')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy">Meu Perfil</h1>
        <p className="text-sm text-siapesq-muted mt-0.5">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl shadow-card border border-siapesq-border p-5 sm:p-8 mb-4 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-navy-mid flex items-center justify-center overflow-hidden border-4 border-siapesq-border">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-bold">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center shadow-md hover:bg-teal-light transition-colors"
          >
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div className="text-center">
          <p className="font-bold text-navy text-lg">{displayName}</p>
          <p className="text-sm text-siapesq-muted">{email}</p>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-white rounded-xl shadow-card border border-siapesq-border p-6 mb-4">
        <h2 className="font-bold text-navy text-sm mb-4">Informações da Conta</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider flex items-center gap-1">
              <User size={11} /> Nome de Exibição
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-siapesq-border px-4 py-2.5 text-sm text-siapesq-dark focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider flex items-center gap-1">
              <Mail size={11} /> E-mail
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-xl border border-siapesq-border px-4 py-2.5 text-sm text-siapesq-muted bg-siapesq-surface cursor-not-allowed"
            />
            <p className="text-xs text-siapesq-muted">O e-mail não pode ser alterado.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-siapesq-surface rounded-xl px-4 py-3 border border-siapesq-border">
              <p className="text-xs text-siapesq-muted flex items-center gap-1 mb-1"><Shield size={11} /> Função</p>
              <p className="text-sm font-semibold text-navy capitalize">{payload?.role ?? 'Pesquisador'}</p>
            </div>
            <div className="bg-siapesq-surface rounded-xl px-4 py-3 border border-siapesq-border">
              <p className="text-xs text-siapesq-muted flex items-center gap-1 mb-1"><Calendar size={11} /> Membro desde</p>
              <p className="text-sm font-semibold text-navy">{since}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-siapesq-border">
          <Button onClick={handleSave} variant={saved ? 'outline' : 'primary'}>
            <Save size={14} />
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-card border border-siapesq-border p-6">
        <h2 className="font-bold text-navy text-sm mb-4">Alterar Senha</h2>
        <div className="flex flex-col gap-4">
          <PasswordInput
            label="Senha atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Digite sua senha atual"
          />
          <PasswordInput
            label="Nova senha"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Minimo de 8 caracteres"
          />
          <PasswordInput
            label="Confirmar nova senha"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repita a nova senha"
          />
        </div>

        {passwordError && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="mt-4 rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-xs text-teal">
            {passwordSuccess}
          </p>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-siapesq-border">
          <Button type="submit" loading={passwordLoading}>
            <Lock size={14} />
            Atualizar Senha
          </Button>
        </div>
      </form>
    </div>
  )
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-siapesq-muted uppercase tracking-wider flex items-center gap-1">
        <Lock size={11} /> {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-siapesq-border px-4 py-2.5 text-sm text-siapesq-dark focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all"
      />
    </div>
  )
}
