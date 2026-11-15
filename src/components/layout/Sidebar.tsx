import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ScanEye,
  Globe,
  Route,
  Archive,
  CircleOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { NAV_ITEMS } from '@/lib/routing'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ScanEye,
  Globe,
  Route,
  Archive,
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={clsx(
        'relative flex flex-col flex-shrink-0',
        'bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-14' : 'w-[var(--sidebar-width)]',
      )}
    >
      <div
        className={clsx(
          'flex items-center border-b border-[var(--color-border)]',
          'h-[var(--topbar-height)]',
          collapsed ? 'justify-center px-2' : 'px-4 gap-2',
        )}
      >
        <div className="w-7 h-7 flex-shrink-0">
          <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="12" fill="var(--color-accent-primary)" opacity="0.15" />
            <circle cx="14" cy="14" r="8" fill="var(--color-accent-primary)" opacity="0.3" />
            <circle cx="14" cy="14" r="4" fill="var(--color-accent-primary)" />
            <circle cx="14" cy="14" r="1.5" fill="var(--color-bg-primary)" />
          </svg>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-heading font-bold text-sm text-[var(--color-text-primary)] whitespace-nowrap leading-tight">
              MARS EXPLORER
            </p>
            <p className="text-[9px] text-[var(--color-text-muted)] font-mono whitespace-nowrap tracking-widest uppercase">
              NASA Space Apps 2026
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-2 text-[9px] font-mono tracking-[0.15em] text-[var(--color-text-disabled)] uppercase">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5 px-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] ?? CircleOff
            const isActive = location.pathname === item.path

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={clsx(
                    'flex items-center rounded-[var(--radius-md)] transition-all duration-150',
                    'text-sm font-medium',
                    collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-3 px-3 h-9',
                    isActive
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent-primary)] border border-[var(--color-border-accent)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-[var(--color-border)]">
          <div className="bg-[var(--color-bg-primary)] rounded-[var(--radius-md)] p-2.5 border border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2 mb-1">
              <div className="status-dot" />
              <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider">
                System Status
              </span>
            </div>
            <p className="text-xs text-[var(--color-status-active)] font-medium">All Systems Nominal</p>
            <p className="text-[10px] text-[var(--color-text-disabled)] mt-0.5">
              No active missions
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setCollapsed(!collapsed)}
        className={clsx(
          'absolute -right-3 top-[calc(var(--topbar-height)+16px)]',
          'w-6 h-6 rounded-full',
          'bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
          'flex items-center justify-center',
          'hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]',
          'text-[var(--color-text-muted)] transition-colors duration-150',
          'z-10',
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  )
}
