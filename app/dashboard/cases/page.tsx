'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Plus,
  FolderOpen,
  ChevronRight,
  Calendar,
  User,
  MapPin,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mockCases } from '@/lib/mock-data'
import {
  getRiskBadgeColor,
  getCaseStatusColor,
  formatDate,
} from '@/lib/utils'
import { RiskLevel, CaseStatus } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CasesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [operatorFilter, setOperatorFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const { t, lang } = useLanguage()

  const filtered = useMemo(() => {
    let result = [...mockCases]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.primaryReason.toLowerCase().includes(q) ||
          c.municipality.toLowerCase().includes(q) ||
          c.operatorName.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }
    if (riskFilter !== 'all') {
      result = result.filter((c) => c.riskLevel === riskFilter)
    }
    if (operatorFilter !== 'all') {
      result = result.filter((c) => c.operatorName === operatorFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === 'risk') {
        const order = { critical: 0, high: 1, moderate: 2, low: 3 }
        return order[a.riskLevel] - order[b.riskLevel]
      }
      return 0
    })

    return result
  }, [search, statusFilter, riskFilter, operatorFilter, sortBy])

  const stats = {
    total: mockCases.length,
    open: mockCases.filter((c) => c.status === 'open').length,
    followUp: mockCases.filter((c) => c.status === 'follow-up').length,
    critical: mockCases.filter((c) => c.riskLevel === 'critical' || c.riskLevel === 'high').length,
  }

  const locale = lang === 'it' ? 'it-IT' : 'en-GB'

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.cases.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} {t.cases.noCases.replace('Nessun caso trovato', 'casos').replace('No cases found', 'cases')} — {mockCases.length} {t.cases.totalCases}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          {t.cases.newCase}
        </Button>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: lang === 'it' ? 'Totale' : 'Total', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: t.caseStatus.open, value: stats.open, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Follow-up', value: stats.followUp, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: t.dashboard.highRisk, value: stats.critical, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`p-3 rounded-lg border ${s.bg} ${s.border}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t.cases.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t.cases.filterStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.allStatuses}</SelectItem>
                <SelectItem value="open">{t.caseStatus.open}</SelectItem>
                <SelectItem value="follow-up">{t.caseStatus['follow-up']}</SelectItem>
                <SelectItem value="escalated">{t.caseStatus.escalated}</SelectItem>
                <SelectItem value="closed">{t.caseStatus.closed}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t.cases.filterRisk} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.common.allRisks}</SelectItem>
                <SelectItem value="critical">{t.risk.critical}</SelectItem>
                <SelectItem value="high">{t.risk.high}</SelectItem>
                <SelectItem value="moderate">{t.risk.moderate}</SelectItem>
                <SelectItem value="low">{t.risk.low}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={operatorFilter} onValueChange={setOperatorFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t.cases.colOperator} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'it' ? 'Tutti gli operatori' : 'All operators'}</SelectItem>
                <SelectItem value="Maria Rossi">Maria Rossi</SelectItem>
                <SelectItem value="Luca Bianchi">Luca Bianchi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder={lang === 'it' ? 'Ordina per' : 'Sort by'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{lang === 'it' ? 'Più recenti' : 'Newest'}</SelectItem>
                <SelectItem value="oldest">{lang === 'it' ? 'Meno recenti' : 'Oldest'}</SelectItem>
                <SelectItem value="risk">{lang === 'it' ? 'Rischio (decrescente)' : 'Risk (descending)'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.cases.colId}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.cases.colRisk}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.cases.colStatus}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  {t.cases.colReason}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                  {t.cases.colMunicipality}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                  {t.cases.colOperator}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">
                  {t.cases.colFollowUp}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t.cases.colDate}
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors group ${
                    c.riskLevel === 'critical' ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {c.riskLevel === 'critical' && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      )}
                      <div>
                        <Link href={`/dashboard/cases/${c.id}`}>
                          <span className="font-mono text-xs font-bold text-blue-800 hover:underline">
                            #{c.id.slice(-6).toUpperCase()}
                          </span>
                        </Link>
                        <p className="text-xs text-gray-400">{c.callId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadgeColor(c.riskLevel)}`}
                    >
                      {t.risk[c.riskLevel]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getCaseStatusColor(c.status)}`}
                    >
                      {t.caseStatus[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-xs text-gray-700 max-w-48 truncate">{c.primaryReason}</p>
                    {c.contextualElements.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {c.contextualElements.slice(0, 2).join(', ')}
                        {c.contextualElements.length > 2 && ` +${c.contextualElements.length - 2}`}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {c.municipality}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{c.region}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {c.operatorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-xs text-gray-700">{c.operatorName.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    {c.followUpRequired && c.followUpDate ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        <span className={`${
                          new Date(c.followUpDate) < new Date() ? 'text-red-600 font-semibold' : 'text-amber-700'
                        }`}>
                          {new Date(c.followUpDate).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-3">
                    <Link href={`/dashboard/cases/${c.id}`}>
                      <Button size="icon" variant="ghost" className="w-7 h-7 opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-400">{t.cases.noCases}</p>
                    <p className="text-xs text-gray-400 mt-1">{lang === 'it' ? 'Modifica i filtri di ricerca' : 'Modify the search filters'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
