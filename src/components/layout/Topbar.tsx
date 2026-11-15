import { useLocation } from 'react-router-dom'
import { Signal, Wifi, Bell } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/routing'
import { Badge } from '@/components/ui/Badge'

function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((n) => n.path === pathname)
  return item?.label ?? 'MARS EXPLORER'
}

export function Topbar() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  const now = new Date()
  const utcString = now.toUTCString().replace(' GMT', ' UTC')

  return (
    <header
      className="
        flex items-center justify-between
        h-[var(--topbar-height)] px-4
        bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]
        flex-shrink-0
      "
    >
      <div className="flex items-center gap-3">
        <div className="accent-line w-4 h-full" />
        <div>
          <h1 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
            {title}
          </h1>
          <p className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
            MARS EXPLORER · NASA Space Apps 2026
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[9px] font-mono text-[var(--color-text-disabled)] uppercase tracking-wider">
            Earth UTC
          </span>
          <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
            {utcString.slice(0, 25)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <Badge variant="muted" size="sm">Offline Mode</Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-[var(--color-status-active)]" />
          <span className="text-[10px] font-mono text-[var(--color-status-active)] hidden sm:inline">
            SIM
          </span>
        </div>

        <button
          className="
            w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)]
            text-[var(--color-text-muted)]
            hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]
            transition-colors duration-150
          "
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
