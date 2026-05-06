'use client'

import { useState, useEffect } from 'react'
import {
  Phone,
  Clock,
  TrendingDown,
  AlertTriangle,
  Users,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import {
  CallsTrendChart,
  RiskDistributionChart,
  CallsByHourChart,
  OutcomeDistributionChart,
} from '@/components/dashboard/Charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRiskBadgeColor, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { KPIData, Case } from '@/lib/types'

export default function DashboardPage() {
  const { t, lang } = useLanguage()
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [recentCases, setRecentCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/kpis').then((r) => r.json()),
      fetch('/api/cases').then((r) => r.json()),
    ])
      .then(([kpis, cases]) => {
        setKpiData(kpis)
        setRecentCases(Array.isArray(cases) ? cases.slice(0, 5) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const highRiskAlerts = recentCases.filter(
    (c) => (c.riskLevel === 'critical' || c.riskLevel === 'high') && c.status !== 'closed'
  )

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t.dashboard.subtitle}{' '}
            {new Date().toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">{t.dashboard.h24LineActive}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title={t.dashboard.totalCalls}
          value={kpiData?.totalCalls ?? 0}
          subtitle={t.dashboard.totalCallsSub}
          icon={Phone}
          trend={{ value: 12, positive: true }}
          color="blue"
        />
        <StatsCard
          title={t.dashboard.avgWait}
          value={`${kpiData?.avgWaitTime ?? 0} min`}
          subtitle={t.dashboard.avgWaitSub}
          icon={Clock}
          trend={{ value: 8, positive: false }}
          color="teal"
        />
        <StatsCard
          title={t.dashboard.abandonRate}
          value={`${kpiData?.abandonRate ?? 0}%`}
          subtitle={t.dashboard.abandonRateSub}
          icon={TrendingDown}
          trend={{ value: 2, positive: true }}
          color="amber"
        />
        <StatsCard
          title={t.dashboard.highRisk}
          value={kpiData?.highRiskCases ?? 0}
          subtitle={t.dashboard.highRiskSub}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title={t.dashboard.activeOperators}
          value="2 / 2"
          subtitle={t.dashboard.activeOperatorsSub}
          icon={Users}
          color="green"
        />
        <StatsCard
          title={t.dashboard.followUpCompliance}
          value={`${kpiData?.followUpCompliance ?? 0}%`}
          subtitle={t.dashboard.followUpComplianceSub}
          icon={CheckCircle2}
          trend={{ value: 5, positive: true }}
          color="purple"
        />
      </div>

      {/* Charts row 1 */}
      {kpiData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <CallsTrendChart data={kpiData} />
            </div>
            <RiskDistributionChart data={kpiData} />
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CallsByHourChart data={kpiData} />
            <OutcomeDistributionChart data={kpiData} />
          </div>
        </>
      )}

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent cases table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.dashboard.recentCases}</CardTitle>
                <Link
                  href="/dashboard/cases"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  {t.dashboard.viewAll} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t.dashboard.colCase}
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t.dashboard.colRisk}
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {t.dashboard.colStatus}
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                        {t.dashboard.colReason}
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                        {t.dashboard.colOperator}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}
                      >
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/cases/${c.id}`} className="group">
                            <p className="font-medium text-blue-800 group-hover:underline text-xs">
                              #{c.id.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(c.createdAt).split(' ')[0]}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(c.riskLevel)}`}
                          >
                            {t.risk[c.riskLevel]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                              c.status === 'open' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              c.status === 'follow-up' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                              c.status === 'closed' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}
                          >
                            {t.caseStatus[c.status as keyof typeof t.caseStatus]}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-gray-700 truncate max-w-32">{c.primaryReason}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs text-gray-600">{c.operatorName}</p>
                        </td>
                      </tr>
                    ))}
                    {recentCases.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                          {t.cases.noCases}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active alerts */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <CardTitle className="text-base text-red-700">{t.dashboard.activeAlerts}</CardTitle>
              <Badge variant="destructive" className="ml-auto">
                {highRiskAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {highRiskAlerts.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/dashboard/cases/${c.id}`}>
                <div className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${
                  c.riskLevel === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {c.primaryReason}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.municipality} • {c.operatorName}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
                        c.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {t.risk[c.riskLevel]}
                    </span>
                  </div>
                  {c.status === 'escalated' && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">{t.dashboard.escalated}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
            {highRiskAlerts.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t.common.noAlerts}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
