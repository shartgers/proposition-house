'use client'

import Link from 'next/link'
import { LogOut, Settings2, Library } from 'lucide-react'

export type DashboardHeaderProps = {
  userEmail: string
  userInitials: string
}

export function DashboardHeader({ userEmail, userInitials }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card flex-shrink-0 shadow-soft">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Xomnia</p>
        <h1 className="font-heading text-base font-semibold leading-tight">Proposition House</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
        <Link href="/cases" title="Case library" className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Library className="w-4 h-4" />
        </Link>
        <Link href="/practices" title="Manage practices" className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Settings2 className="w-4 h-4" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold flex-shrink-0">
          {userInitials}
        </div>
        <form action="/auth/signout" method="POST">
          <button type="submit" title="Sign out" className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  )
}
