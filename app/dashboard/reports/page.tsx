'use client'

import { useState } from 'react'
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { mockKPIData, mockCases, mockFollowUps } from '@/lib/mock-data'
import { useLanguage } from '@/contexts/LanguageContext'

const riskColors = {
  critical: '#dc2626',
  high: '#ea580c',
  moderate: '#d97706',
  low: '#16a34a',
}

const operatorReport = [
  {
    name: 'Maria Rossi',
    calls: 248,
    avgDuration: 22.4,
    highRisk: 18,
    followUpCompliance: 87.5,
    satisfaction: 4.2,
  },
  {
    name: 'Luca Bianchi',
    calls: 196,
    avgDuration: 26.1,
    highRisk: 12,
    followUpCompliance: 78.9,
    satisfaction: 4.0,
  },
]

const riskTrend = [
  { week: 'Sett 1', critical: 2, high: 8, moderate: 15, low: 12 },
  { week: 'Sett 2', critical: 3, high: 10, moderate: 18, low: 10 },
  { week: 'Sett 3', critical: 1, high: 7, moderate: 14, low: 16 },
  { week: 'Sett 4', critical: 4, high: 11, moderate: 16, low: 14 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month')
  const { t, lang } = useLanguage()

  const locale = lang === 'it' ? 'it-IT' : 'en-GB'

  const totalCalls = mockKPIData.callsTrend.reduce((sum, d) => sum + d.calls, 0)
  const totalAbandoned = mockKPIData.callsTrend.reduce((sum, d) => sum + d.abandoned, 0)
  const openCases = mockCases.filter((c) => c.status !== 'closed').length
  const closedCases = mockCases.filter((c) => c.status === 'closed').length
  const followUpCompleted = mockFollowUps.filter((f) => f.status === 'completed').length
  const followUpTotal = mockFollowUps.filter((f) => f.status !== 'cancelled').length

  const handleExportCSV = () => {
    const headers = [t.cases.colId, t.cases.colDate, t.cases.colRisk, t.cases.colStatus, t.cases.colReason, t.cases.colMunicipality, t.cases.colOperator, t.caseDetail.outcome]
    const rows = mockCases.map((c) => [
      c.id,
      new Date(c.createdAt).toLocaleDateString(locale),
      t.risk[c.riskLevel],
      t.caseStatus[c.status],
      c.primaryReason,
      c.municipality,
      c.operatorName,
      c.outcome,
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crisislink-report-${new Date().toLocaleDateString(locale).replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-700" />
            {t.reports.title}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t.reports.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t.reports.periodThisWeek}</SelectItem>
              <SelectItem value="month">{t.reports.periodThisMonth}</SelectItem>
              <SelectItem value="quarter">{lang === 'it' ? 'Questo trimestre' : 'This quarter'}</SelectItem>
              <SelectItem value="year">{lang === 'it' ? "Quest'anno" : 'This year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            {t.reports.printReport}
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            {t.reports.exportCSV}
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: lang === 'it' ? 'Chiamate Totali' : 'Total Calls',
            value: totalCalls,
            sub: `${dateRange === 'week' ? (lang === 'it' ? '7 giorni' : '7 days') : dateRange === 'month' ? (lang === 'it' ? '30 giorni' : '30 days') : (lang === 'it' ? '90 giorni' : '90 days')}`,
            trend: '+12%',
            trendUp: true,
            color: 'blue',
            icon: Clock,
          },
          {
            label: t.dashboard.abandonRate,
            value: `${((totalAbandoned / totalCalls) * 100).toFixed(1)}%`,
            sub: `${totalAbandoned} ${lang === 'it' ? 'abbandonate' : 'abandoned'}`,
            trend: '-2%',
            trendUp: true,
            color: 'amber',
            icon: TrendingDown,
          },
          {
            label: lang === 'it' ? 'Casi Gestiti' : 'Managed Cases',
            value: mockCases.length,
            sub: `${closedCases} ${lang === 'it' ? 'chiusi' : 'closed'}, ${openCases} ${lang === 'it' ? 'aperti' : 'open'}`,
            trend: '+8%',
            trendUp: true,
            color: 'green',
            icon: CheckCircle2,
          },
          {
            label: t.dashboard.followUpCompliance,
            value: `${Math.round((followUpCompleted / Math.max(followUpTotal, 1)) * 100)}%`,
            sub: `${followUpCompleted} / ${followUpTotal}`,
            trend: '+5%',
            trendUp: true,
            color: 'purple',
            icon: Users,
          },
        ].map((kpi) => {
          const Icon = kpi.icon
          const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'bg-blue-100' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'bg-amber-100' },
            green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'bg-green-100' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'bg-purple-100' },
          }
          const colorClasses = colorMap[kpi.color] ?? colorMap.blue

          return (
            <div key={kpi.label} className={`p-4 rounded-xl border ${colorClasses.bg} ${colorClasses.border}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses.icon}`}>
                  <Icon className={`w-4 h-4 ${colorClasses.text}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${colorClasses.text}`}>{kpi.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">{kpi.sub}</p>
                <span className={`text-xs font-semibold ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabbed reports */}
      <Tabs defaultValue="volume" className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="volume">{t.reports.sectionCallVolume}</TabsTrigger>
          <TabsTrigger value="risk">{t.reports.sectionRiskDist}</TabsTrigger>
          <TabsTrigger value="followup">{t.reports.sectionCompliance}</TabsTrigger>
          <TabsTrigger value="operators">{t.reports.sectionOperator}</TabsTrigger>
        </TabsList>

        {/* Volume report */}
        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{lang === 'it' ? 'Andamento Chiamate — 7 Giorni' : 'Call Trend — 7 Days'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={mockKPIData.callsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="calls" stroke="#1e40af" strokeWidth={2.5} dot={{ r: 4 }} name={lang === 'it' ? 'Totale' : 'Total'} />
                  <Line type="monotone" dataKey="abandoned" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name={lang === 'it' ? 'Abbandonate' : 'Abandoned'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Volume data table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{lang === 'it' ? 'Tabella Dati — Volume Chiamate' : 'Data Table — Call Volume'}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[t.reports.colDate, t.reports.colTotal, t.reports.colAbandoned, lang === 'it' ? 'Tasso Abbandono' : 'Abandon Rate', 'Trend'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockKPIData.callsTrend.map((row, idx) => {
                    const rate = ((row.abandoned / row.calls) * 100).toFixed(1)
                    const prevCalls = idx > 0 ? mockKPIData.callsTrend[idx - 1].calls : row.calls
                    const trend = row.calls >= prevCalls
                    return (
                      <tr key={row.date} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-medium text-gray-800">{row.date}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-700">{row.calls}</td>
                        <td className="py-2.5 px-3 text-red-600">{row.abandoned}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-xs font-medium ${parseFloat(rate) < 10 ? 'text-green-600' : 'text-amber-600'}`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {trend ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk distribution report */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{lang === 'it' ? 'Distribuzione Rischio per Settimana' : 'Risk Distribution by Week'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={riskTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="critical" stackId="a" fill="#dc2626" name={t.risk.critical} />
                    <Bar dataKey="high" stackId="a" fill="#ea580c" name={t.risk.high} />
                    <Bar dataKey="moderate" stackId="a" fill="#d97706" name={t.risk.moderate} />
                    <Bar dataKey="low" stackId="a" fill="#16a34a" name={t.risk.low} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{lang === 'it' ? 'Riepilogo per Livello di Rischio' : 'Summary by Risk Level'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockKPIData.callsByRisk.map((item) => (
                  <div key={item.level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.level}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        <span className="text-xs text-gray-400">
                          ({Math.round((item.count / mockKPIData.callsByRisk.reduce((s, r) => s + r.count, 0)) * 100)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.count / mockKPIData.callsByRisk.reduce((s, r) => s + r.count, 0)) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Follow-up compliance report */}
        <TabsContent value="followup" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: lang === 'it' ? 'Totale Follow-up' : 'Total Follow-ups', value: followUpTotal },
              { label: t.followups.statusCompleted, value: followUpCompleted, color: 'text-green-700' },
              { label: t.followups.overdue, value: mockFollowUps.filter(f => f.status === 'overdue').length, color: 'text-red-700' },
            ].map((s) => (
              <div key={s.label} className="p-4 bg-white border border-gray-200 rounded-xl text-center">
                <p className={`text-3xl font-bold ${s.color || 'text-gray-900'}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{lang === 'it' ? 'Tabella Follow-up' : 'Follow-up Table'}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[t.cases.colId, lang === 'it' ? 'Chiamante' : 'Caller', t.followups.colPriority, t.reports.colDate, t.reports.colOperator, t.followups.colStatus].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockFollowUps.map((fu) => (
                    <tr key={fu.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono text-xs text-blue-700">#{fu.caseId.slice(-6)}</td>
                      <td className="py-2 px-3 text-xs text-gray-700">{fu.callerId}</td>
                      <td className="py-2 px-3">
                        <span className="text-xs font-medium">{t.risk[fu.priority]}</span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {new Date(fu.scheduledDate).toLocaleDateString(locale)}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-700">{fu.operatorName}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          fu.status === 'completed' ? 'bg-green-100 text-green-700' :
                          fu.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {fu.status === 'completed' ? t.followups.statusCompleted :
                           fu.status === 'overdue' ? t.followups.statusOverdue : t.followups.statusPending}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operator performance report */}
        <TabsContent value="operators" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t.reports.sectionOperator}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {[t.reports.colOperator, t.reports.colCalls, lang === 'it' ? 'Durata Media' : 'Avg Duration', lang === 'it' ? 'Alto Rischio' : 'High Risk', 'F.U. Compliance', lang === 'it' ? 'Soddisfazione' : 'Satisfaction'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {operatorReport.map((op) => (
                    <tr key={op.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                            {op.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900">{op.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-blue-700">{op.calls}</td>
                      <td className="py-3 px-3 text-gray-700">{op.avgDuration} min</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${op.highRisk > 15 ? 'text-orange-600' : 'text-gray-700'}`}>
                          {op.highRisk}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${op.followUpCompliance}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${op.followUpCompliance >= 85 ? 'text-green-600' : 'text-amber-600'}`}>
                            {op.followUpCompliance}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-sm ${star <= Math.round(op.satisfaction) ? 'text-amber-400' : 'text-gray-200'}`}>
                              ★
                            </span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({op.satisfaction})</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Bar chart comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{lang === 'it' ? 'Confronto Chiamate per Operatore' : 'Call Comparison by Operator'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={operatorReport} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="calls" fill="#1e40af" radius={[0, 4, 4, 0]} name={lang === 'it' ? 'Chiamate totali' : 'Total calls'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
