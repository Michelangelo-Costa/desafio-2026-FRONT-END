import type { ReactNode } from 'react'
import loginHero from '../../assets/Home_Login.png'
import logo from '../../assets/LOGO_Siapesq.png'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col bg-white lg:flex-row">
      <div className="relative h-[clamp(13.5rem,34vw,18rem)] w-full flex-shrink-0 overflow-hidden bg-navy lg:hidden">
        <img
          src={loginHero}
          alt="Apresentacao visual do Arca em uso"
          className="absolute inset-0 h-full w-full object-cover object-[right_24%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 to-navy/10 pointer-events-none" />
        <img
          src={logo}
          alt="SIAPESQ"
          className="absolute left-5 top-5 h-8 drop-shadow-lg"
        />
      </div>

      <main className="flex flex-1 justify-center overflow-y-auto px-6 py-8 sm:px-10 lg:items-center lg:w-[min(43vw,620px)] lg:flex-none lg:px-14 lg:py-10">
        <div className="w-full max-w-sm">
          <img
            src={logo}
            alt="SIAPESQ"
            className="mb-8 hidden h-10 lg:block"
          />
          {children}
        </div>
      </main>

      <aside className="relative hidden flex-1 overflow-hidden bg-navy lg:block">
        <img
          src={loginHero}
          alt="Apresentacao visual do Arca em uso"
          className="h-full w-full object-fill"
        />
      </aside>
    </div>
  )
}
