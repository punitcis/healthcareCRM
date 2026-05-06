'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Phone,
  AlertTriangle,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Coffee,
  Wifi,
  WifiOff,
  Shield,
  Bell,
  Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getRiskBadgeColor, getCallDuration, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Case } from '@/lib/types'

const alertsData = [
  {
    id: 'a1',
    type: 'critical',
    title: 'Follow-up scaduto — Caso critico',
    desc: 'Il follow-up per il caso #case-003 (violenza domestica) è scaduto da ieri. Richiede contatto immediato.',
    time: 'Scaduto 24 ore fa',
    caseId: 'case-003',
  },
  {
    id: 'a2',
    type: 'high',
    title: 'Caso alto rischio aperto da 2 giorni',
    desc: 'Il caso #case-001 (ideazione suicidaria, alto rischio) è aperto da 2 giorni senza aggiornamenti di supervisione.',
    time: '2 giorni fa',
    caseId: 'case-001',
  },
  {
    id: 'a3',
    type: 'warning',
    title: 'Follow-up critico domani',
    desc: 'Follow-up post-tentativo per caso #case-005 programmato per domani. Richiede preparazione supervisore.',
    time: 'Domani',
    caseId: 'case-005',
  },
]

interface SupervisionData {
  activeCalls: any[]
  queueCalls: any[]
  openHighRisk: Case[]
  operatorStats: any[]
}

export default function SupervisionPage() {
  const [liveTimers, setLiveTimers] = useState<Record<string, string>>({})
  const [supervisionData, setSupervisionData] = useState<SupervisionData>({
    activeCalls: [],
    queueCalls: [],
    openHighRisk: [],
    operatorStats: [],
  })
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLanguage()

  useEffect(() => {
    fetch('/api/supervision')
      .then((r) => r.json())
      .then((data) => {
        setSupervisionData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const activeCalls = supervisionData.activeCalls
  const queueCalls = supervisionData.queueCalls
  const openHighRisk = supervisionData.openHighRisk
  const operatorStats = supervisionData.operatorStats

  const statusConfig = {
    available: { label: t.supervision.statusAvailable, color: 'bg-green-500', icon: Wifi, textColor: 'text-green-700', bg: 'bg-green-50' },
    busy: { label: lang === 'it' ? 'In chiamata' : 'On call', color: 'bg-blue-500', icon: Phone, textColor: 'text-blue-700', bg: 'bg-blue-50' },
    break: { label: t.supervision.statusBreak, color: 'bg-amber-500', icon: Coffee, textColor: 'text-amber-700', bg: 'bg-amber-50' },
    offline: { label: t.supervision.statusOffline, color: 'bg-gray-400', icon: WifiOff, textColor: 'text-gray-500', bg: 'bg-gray-50' },
  }

  useEffect(() => {
    const update = () => {
      const timers: Record<string, string> = {}
      activeCalls.forEach((call) => {
        timers[call.id] = getCallDuration(call.startTime)
      })
      setLiveTimers(timers)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [activeCalls])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-700" />
            {t.supervision.title}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{t.supervision.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">{lang === 'it' ? 'Live Monitor Attivo' : 'Live Monitor Active'}</span>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t.supervision.operatorsOnline,
            value: '2 / 2',
            sublabel: lang === 'it' ? '100% disponibili' : '100% available',
            color: 'text-green-700',
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: Users,
          },
          {
            label: t.supervision.activeCalls,
            value: activeCalls.length,
            sublabel: `${queueCalls.length} ${lang === 'it' ? 'in coda' : 'in queue'}`,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: Phone,
          },
          {
            label: t.supervision.openHighRisk,
            value: openHighRisk.length,
            sublabel: lang === 'it' ? 'Richiedono attenzione' : 'Require attention',
            color: 'text-red-700',
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: AlertTriangle,
          },
          {
            label: t.supervision.alertsTitle,
            value: alertsData.length,
            sublabel: lang === 'it' ? '1 critico' : '1 critical',
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: Bell,
          },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`p-4 rounded-xl border ${s.bg} ${s.border}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500">{s.label}</p>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.sublabel}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Operator status grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {lang === 'it' ? 'Stato Operatori in Tempo Reale' : 'Real-time Operator Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {operatorStats.map((op) => {
                const status = statusConfig[op.status as keyof typeof statusConfig] ?? statusConfig.available
                const StatusIcon = status.icon
                return (
                  <div
                    key={op.id}
                    className={`p-4 rounded-xl border ${status.bg} border-opacity-50`}
                    style={{ borderColor: op.status === 'busy' ? '#bfdbfe' : op.status === 'available' ? '#bbf7d0' : '#fde68a' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200">
                          <span className="text-sm font-bold text-gray-700">
                            {op.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{op.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${status.color}`} />
                            <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
                            {op.status === 'busy' && (
                              <span className="text-xs text-gray-500 ml-1 font-mono">{op.currentCallDuration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="w-3 h-3" />
                        {t.supervision.silentMonitor}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{op.callsToday}</p>
                        <p className="text-xs text-gray-500">{lang === 'it' ? 'Chiamate' : 'Calls'}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{op.avgDuration} min</p>
                        <p className="text-xs text-gray-500">{lang === 'it' ? 'Durata media' : 'Avg duration'}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className={`text-lg font-bold ${op.highRiskCases > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                          {op.highRiskCases}
                        </p>
                        <p className="text-xs text-gray-500">{lang === 'it' ? 'Alto Rischio' : 'High Risk'}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Live calls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                {t.supervision.liveCallsTitle}
                <span className="ml-auto text-xs font-normal text-gray-500">
                  {activeCalls.length} {lang === 'it' ? 'attive' : 'active'}, {queueCalls.length} {lang === 'it' ? 'in coda' : 'in queue'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCalls.length > 0 ? (
                <div className="space-y-2">
                  {activeCalls.map((call) => (
                    <div
                      key={call.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        call.riskLevel === 'critical'
                          ? 'bg-red-50 border-red-200'
                          : call.riskLevel === 'high'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {call.callerId}
                          </span>
                          {call.riskLevel && (
                            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${getRiskBadgeColor(call.riskLevel)}`}>
                              {t.risk[call.riskLevel as keyof typeof t.risk]}
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            call.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {call.status === 'active' ? t.console.active : t.console.onHold}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-500">{call.operatorName || (lang === 'it' ? 'Non assegnata' : 'Unassigned')}</span>
                          <span className="text-xs font-mono text-blue-600 font-bold">
                            {liveTimers[call.id] || '--:--'}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs shrink-0">
                        {lang === 'it' ? 'Intervieni' : 'Intervene'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Phone className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{t.console.noActiveCalls}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts panel */}
          <Card className="border-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                <Bell className="w-4 h-4" />
                {lang === 'it' ? 'Alert di Sistema' : 'System Alerts'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              {alertsData.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : alert.type === 'high'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        alert.type === 'critical'
                          ? 'text-red-600'
                          : alert.type === 'high'
                          ? 'text-orange-600'
                          : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{alert.desc}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{alert.time}</span>
                        <Link href={`/dashboard/cases/${alert.caseId}`}>
                          <button className="text-xs text-blue-600 hover:underline">{lang === 'it' ? 'Vedi caso' : 'View case'}</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Open high risk cases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                {lang === 'it' ? 'Casi Aperti ad Alto Rischio' : 'Open High Risk Cases'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              {openHighRisk.slice(0, 5).map((c) => (
                <Link key={c.id} href={`/dashboard/cases/${c.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      c.riskLevel === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{c.primaryReason}</p>
                      <p className="text-xs text-gray-500">{c.municipality} • {c.operatorName}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${getRiskBadgeColor(c.riskLevel)}`}>
                      {t.risk[c.riskLevel]}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Queue status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                {lang === 'it' ? 'Stato Coda' : 'Queue Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{lang === 'it' ? 'In coda ora' : 'In queue now'}</span>
                <span className="text-sm font-bold text-gray-900">{queueCalls.length} {lang === 'it' ? 'chiamate' : 'calls'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{lang === 'it' ? 'Attesa stimata' : 'Estimated wait'}</span>
                <span className="text-sm font-bold text-amber-700">~2.3 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{lang === 'it' ? 'Tasso abbandono oggi' : 'Abandon rate today'}</span>
                <span className="text-sm font-bold text-gray-900">8.5%</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{lang === 'it' ? 'Capacità operatori' : 'Operator capacity'}</span>
                  <span className="font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
