'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Bell, LogOut, User, ChevronDown, Settings, AlertCircle, Globe } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getRoleLabel } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface HeaderProps {
  userName: string
  userRole: string
  alerts?: number
}

export default function Header({ userName, userRole, alerts = 3 }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { lang, setLang, t } = useLanguage()

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const notifications = [
    { id: 1, text: `${t.notifications.overdueFollowUp} #case-003`, type: 'critical', time: `5 ${t.notifications.minutesAgo}` },
    { id: 2, text: `${t.notifications.criticalCaseOpen} #case-005`, type: 'high', time: `12 ${t.notifications.minutesAgo}` },
    { id: 3, text: t.notifications.newFollowUp, type: 'info', time: t.notifications.hourAgo },
  ]

  const roleLabel = lang === 'it' ? getRoleLabel(userRole) : (t.roles[userRole as keyof typeof t.roles] ?? getRoleLabel(userRole))

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-500">{t.common.systemActive}</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-700">
          {new Date().toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'it' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          title={lang === 'en' ? 'Switch to Italian' : "Passa all'inglese"}
        >
          <Globe className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{lang === 'en' ? 'IT' : 'EN'}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {alerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-xs font-bold bg-red-500 text-white rounded-full">
                {alerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">{t.common.notifications}</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex gap-3"
                  >
                    <AlertCircle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        notif.type === 'critical'
                          ? 'text-red-500'
                          : notif.type === 'high'
                          ? 'text-orange-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 font-medium">{notif.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center">
                <button className="text-xs text-blue-600 hover:underline">
                  {t.common.viewAll}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{userName}</p>
              <p className="text-xs text-gray-500">{roleLabel}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{roleLabel}</p>
                <Badge variant="info" className="mt-1 text-xs">
                  {roleLabel}
                </Badge>
              </div>
              <div className="p-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <User className="w-4 h-4" />
                  {t.common.profile}
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  <Settings className="w-4 h-4" />
                  {t.common.settings}
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.common.signOut}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}
