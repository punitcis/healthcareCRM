'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PhoneCall,
  FolderOpen,
  CalendarClock,
  BookOpen,
  ShieldAlert,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Activity,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'

interface SidebarProps {
  userRole: UserRole
  activeCalls?: number
}

export default function Sidebar({ userRole, activeCalls = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    {
      href: '/dashboard',
      label: t.nav.dashboard,
      icon: LayoutDashboard,
      roles: ['operator', 'coordinator', 'supervisor', 'admin'] as UserRole[],
    },
    {
      href: '/dashboard/console',
      label: t.nav.console,
      icon: PhoneCall,
      roles: ['operator', 'coordinator'] as UserRole[],
      badge: activeCalls,
    },
    {
      href: '/dashboard/cases',
      label: t.nav.cases,
      icon: FolderOpen,
      roles: ['operator', 'coordinator', 'supervisor', 'admin'] as UserRole[],
    },
    {
      href: '/dashboard/followups',
      label: t.nav.followups,
      icon: CalendarClock,
      roles: ['operator', 'coordinator', 'supervisor', 'admin'] as UserRole[],
    },
    {
      href: '/dashboard/directory',
      label: t.nav.directory,
      icon: BookOpen,
      roles: ['operator', 'coordinator', 'supervisor', 'admin'] as UserRole[],
    },
    {
      href: '/dashboard/supervision',
      label: t.nav.supervision,
      icon: ShieldAlert,
      roles: ['supervisor', 'admin'] as UserRole[],
    },
    {
      href: '/dashboard/reports',
      label: t.nav.reports,
      icon: BarChart3,
      roles: ['coordinator', 'supervisor', 'admin'] as UserRole[],
    },
  ]

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-blue-900 text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-blue-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-cyan-500 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">CrisisLink</span>
              <p className="text-xs text-blue-300">Helpline CRM</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-8 h-8 bg-cyan-500 rounded-lg mx-auto">
            <Heart className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1 rounded-md hover:bg-blue-700 transition-colors',
            collapsed && 'mx-auto mt-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-blue-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-blue-300" />
          )}
        </button>
      </div>

      {/* Active calls indicator */}
      {!collapsed && activeCalls > 0 && (
        <div className="mx-3 mt-3 p-2 bg-red-900/50 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-red-400 animate-pulse" />
            <span className="text-xs text-red-300 font-medium">
              {t.nav.activeCalls(activeCalls)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative',
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-blue-300 group-hover:text-white')} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {!collapsed && item.badge && item.badge > 0 ? (
                <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              ) : null}
              {collapsed && item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-blue-700">
          <p className="text-xs text-blue-400 text-center">{t.common.h24Active}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-xs text-green-400 font-medium">{t.common.operational}</p>
          </div>
        </div>
      )}
    </div>
  )
}
