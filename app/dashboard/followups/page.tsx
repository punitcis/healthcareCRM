'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Filter,
  ListFilter,
  CalendarDays,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getRiskBadgeColor, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { FollowUp } from '@/lib/types'

export default function FollowUpsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [operatorFilter, setOperatorFilter] = useState('all')
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLanguage()

  const fetchFollowUps = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    fetch(`/api/followups?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setFollowUps(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => {
    fetchFollowUps()
  }, [fetchFollowUps])

  const handleMarkComplete = async (id: string) => {
    await fetch(`/api/followups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', completedDate: new Date().toISOString() }),
    })
    fetchFollowUps()
  }

  const filtered = useMemo(() => {
    let result = [...followUps]
    if (priorityFilter !== 'all') result = result.filter((f) => f.priority === priorityFilter)
    if (operatorFilter !== 'all') result = result.filter((f) => f.operatorName === operatorFilter)

    // Sort: overdue first, then pending by date, then completed
    return result.sort((a, b) => {
      const order: Record<string, number> = { overdue: 0, pending: 1, completed: 2, cancelled: 3 }
      if (order[a.status] !== order[b.status]) return (order[a.status] ?? 4) - (order[b.status] ?? 4)
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    })
  }, [followUps, priorityFilter, operatorFilter])

  const stats = {
    pending: followUps.filter((f) => f.status === 'pending').length,
    overdue: followUps.filter((f) => f.status === 'overdue').length,
    completedThisWeek: followUps.filter((f) => f.status === 'completed').length,
    compliance: Math.round(
      (followUps.filter((f) => f.status === 'completed').length /
        Math.max(followUps.filter((f) => f.status !== 'cancelled').length, 1)) *
        100
    ),
  }

  const statusConfig = {
    pending: { label: t.followups.statusPending, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    overdue: { label: t.followups.overdueLabel, color: 'bg-red-100 text-red-800 border-red-200' },
    completed: { label: t.followups.statusCompleted, color: 'bg-green-100 text-green-800 border-green-200' },
    cancelled: { label: t.followups.statusCancelled, color: 'bg-gray-100 text-gray-600 border-gray-200' },
  }

  const locale = lang === 'it' ? 'it-IT' : 'en-GB'

  const groupedByDate = useMemo(() => {
    const groups: Record<string, FollowUp[]> = {}
    filtered.forEach((fu) => {
      const date = new Date(fu.scheduledDate).toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(fu)
    })
    return groups
  }, [filtered, locale])

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.followups.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t.followups.subtitle}
          </p>
        </div>
        <Button>
          <Calendar className="w-4 h-4" />
          {lang === 'it' ? 'Nuovo Follow-up' : 'New Follow-up'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t.followups.pending,
            value: stats.pending,
            icon: Clock,
            color: 'amber',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
          },
          {
            label: t.followups.overdue,
            value: stats.overdue,
            icon: AlertTriangle,
            color: 'red',
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-700',
          },
          {
            label: t.followups.completedWeek,
            value: stats.completedThisWeek,
            icon: CheckCircle2,
            color: 'green',
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-700',
          },
          {
            label: t.followups.compliance,
            value: `${stats.compliance}%`,
            icon: Filter,
            color: 'blue',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-700',
          },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`p-4 rounded-xl border ${s.bg} ${s.border}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{s.label}</p>
                <Icon className={`w-4 h-4 ${s.text}`} />
              </div>
              <p className={`text-2xl font-bold mt-1 ${s.text}`}>{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Alert: overdue */}
      {stats.overdue > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {stats.overdue} {lang === 'it' ? `follow-up scaduт${stats.overdue === 1 ? 'o' : 'i'} — azione richiesta` : `overdue follow-up${stats.overdue === 1 ? '' : 's'} — action required`}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {lang === 'it' ? 'I casi scaduti includono pazienti ad alto rischio che necessitano contatto immediato' : 'Overdue cases include high-risk patients requiring immediate contact'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-gray-200">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
          <ListFilter className="w-4 h-4" />
          {t.common.filters}:
        </span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t.followups.colStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.common.allStatuses}</SelectItem>
            <SelectItem value="pending">{t.followups.statusPending}</SelectItem>
            <SelectItem value="overdue">{t.followups.statusOverdue}</SelectItem>
            <SelectItem value="completed">{t.followups.statusCompleted}</SelectItem>
            <SelectItem value="cancelled">{t.followups.statusCancelled}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t.followups.colPriority} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === 'it' ? 'Tutte le priorità' : 'All priorities'}</SelectItem>
            <SelectItem value="critical">{t.risk.critical}</SelectItem>
            <SelectItem value="high">{t.risk.high}</SelectItem>
            <SelectItem value="moderate">{t.risk.moderate}</SelectItem>
            <SelectItem value="low">{t.risk.low}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={operatorFilter} onValueChange={setOperatorFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t.followups.colOperator} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === 'it' ? 'Tutti' : 'All'}</SelectItem>
            <SelectItem value="Maria Rossi">Maria Rossi</SelectItem>
            <SelectItem value="Luca Bianchi">Luca Bianchi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Follow-ups list */}
      <div className="space-y-4">
        {Object.entries(groupedByDate).map(([date, fus]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-600 capitalize">{date}</h3>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{fus.length} item</span>
            </div>

            <div className="space-y-2">
              {fus.map((fu) => (
                <Card
                  key={fu.id}
                  className={`transition-shadow hover:shadow-md ${
                    fu.status === 'overdue'
                      ? 'border-red-200 bg-red-50/40'
                      : fu.status === 'completed'
                      ? 'border-green-200 bg-green-50/20 opacity-75'
                      : fu.priority === 'critical' || fu.priority === 'high'
                      ? 'border-orange-200 bg-orange-50/20'
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5 ${
                            fu.status === 'overdue'
                              ? 'bg-red-100'
                              : fu.status === 'completed'
                              ? 'bg-green-100'
                              : 'bg-amber-100'
                          }`}
                        >
                          {fu.status === 'overdue' ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : fu.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link href={`/dashboard/cases/${fu.caseId}`}>
                              <span className="font-mono text-xs font-bold text-blue-800 hover:underline">
                                {fu.callerId}
                              </span>
                            </Link>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                                statusConfig[fu.status].color
                              }`}
                            >
                              {statusConfig[fu.status].label}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${getRiskBadgeColor(fu.priority)}`}
                            >
                              {t.followups.colPriority} {t.risk[fu.priority]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1.5">{fu.notes}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(fu.scheduledDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {fu.operatorName}
                            </span>
                          </div>
                          {fu.outcome && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                              <p className="text-xs font-semibold text-green-700">{lang === 'it' ? 'Esito' : 'Outcome'}:</p>
                              <p className="text-sm text-green-800 mt-0.5">{fu.outcome}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {fu.status === 'pending' || fu.status === 'overdue' ? (
                          <>
                            <Button size="sm" variant="outline" className="text-xs h-7">
                              <RotateCcw className="w-3 h-3" />
                              {t.followups.reschedule}
                            </Button>
                            <Button size="sm" variant="success" className="text-xs h-7" onClick={() => handleMarkComplete(fu.id)}>
                              <CheckCircle2 className="w-3 h-3" />
                              {t.followups.markComplete}
                            </Button>
                          </>
                        ) : fu.status === 'completed' ? (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.followups.statusCompleted}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <CheckCircle2 className="w-12 h-12 text-green-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">{t.followups.noFollowUps}</p>
            <p className="text-xs text-gray-400 mt-1">{lang === 'it' ? 'Modifica i filtri o aggiungi un nuovo follow-up' : 'Modify the filters or add a new follow-up'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
