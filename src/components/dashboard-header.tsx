'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'

export type DashboardHeaderProps = {
  userInitials: string
}

export function DashboardHeader({ userInitials }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-card flex-shrink-0 shadow-soft">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Xomnia</p>
        <h1 className="font-heading text-base font-semibold leading-tight">Proposition House</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Case library
        </Link>
        <Link href="/practices" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Practices &amp; sectors
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
