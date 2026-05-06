'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Phone,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Shield,
  Activity,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  getRiskBadgeColor,
  getCaseStatusColor,
  formatDate,
} from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { use, useState, useEffect } from 'react'
import { Case, FollowUp, AuditEntry } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CaseDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { t, lang } = useLanguage()
  const [caseData, setCaseData] = useState<(Case & { auditLogs?: AuditEntry[]; followUps?: FollowUp[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFoundState(true); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setCaseData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-5xl mx-auto">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (notFoundState || !caseData) {
    notFound()
  }

  const caseFollowUps = (caseData as any).followUps ?? []
  const auditLog = (caseData as any).auditLogs ?? []

  const cssrs = caseData.cssrsScore

  const ideationItems = [
    { key: 'passive', label: 'Ideazione passiva (desiderio di essere morto/a)', value: cssrs.ideation.passive },
    { key: 'activeNoIntent', label: 'Ideazione attiva non specifica (senza piano)', value: cssrs.ideation.activeNoIntent },
    { key: 'activeNoMethod', label: 'Ideazione attiva senza metodo', value: cssrs.ideation.activeNoMethod },
    { key: 'activePlanNoIntent', label: 'Ideazione attiva con qualche intenzione', value: cssrs.ideation.activePlanNoIntent },
    { key: 'activePlanIntent', label: 'Ideazione attiva con piano e intenzione', value: cssrs.ideation.activePlanIntent },
  ]

  const behaviorItems = [
    { key: 'preparatoryBehavior', label: 'Comportamento preparatorio', value: cssrs.behavior.preparatoryBehavior },
    { key: 'abortedAttempt', label: 'Tentativo interrotto (da se stesso)', value: cssrs.behavior.abortedAttempt },
    { key: 'interruptedAttempt', label: 'Tentativo interrotto (da altri)', value: cssrs.behavior.interruptedAttempt },
    { key: 'actualAttempt', label: 'Tentativo di suicidio', value: cssrs.behavior.actualAttempt },
    { key: 'nonSuicidalSelfInjury', label: 'Autolesionismo non suicidario (NSSI)', value: cssrs.behavior.nonSuicidalSelfInjury },
  ]

  const intensityLabels = ['', 'Minima', 'Bassa', 'Media', 'Alta', 'Massima']
  const intensityItems = [
    { label: 'Frequenza', value: cssrs.intensity.frequency },
    { label: 'Durata', value: cssrs.intensity.duration },
    { label: 'Controllabilità', value: cssrs.intensity.controllability },
    { label: 'Deterrenti', value: cssrs.intensity.deterrents },
    { label: 'Ragioni', value: cssrs.intensity.reasons },
  ]

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Breadcrumb + Header */}
      <div>
        <Link href="/dashboard/cases" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t.caseDetail.back}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 font-mono">
                  Caso #{caseData.id.slice(-6).toUpperCase()}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(caseData.riskLevel)}`}>
                  {t.risk[caseData.riskLevel]}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getCaseStatusColor(caseData.status)}`}>
                  {t.caseStatus[caseData.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Creato: {formatDate(caseData.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Aggiornato: {formatDate(caseData.updatedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {caseData.operatorName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">{t.common.edit}</Button>
            <Button size="sm">{t.caseDetail.back.replace('Back to', 'Close').replace('Torna ai', 'Chiudi')}</Button>
          </div>
        </div>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1 h-auto gap-1">
          {[
            { value: 'overview', label: t.caseDetail.tabOverview, icon: Info },
            { value: 'cssrs', label: 'C-SSRS', icon: Shield },
            { value: 'intervention', label: t.caseDetail.tabIntervention, icon: Activity },
            { value: 'followup', label: `${t.caseDetail.tabFollowUp} (${caseFollowUps.length})`, icon: Calendar },
            { value: 'audit', label: t.caseDetail.tabAudit, icon: BookOpen },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-xs">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Socio-demographic */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {t.caseDetail.sectionDemographic}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: t.caseDetail.ageRange, value: `${caseData.ageRange} anni` },
                  { label: t.caseDetail.gender, value: caseData.gender },
                  { label: t.caseDetail.region, value: caseData.region },
                  { label: t.caseDetail.municipality, value: caseData.municipality },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Call details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  {t.caseDetail.sectionCall}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'ID Chiamata', value: caseData.callId },
                  { label: t.caseDetail.primaryReason, value: caseData.primaryReason },
                  { label: t.caseDetail.outcome, value: caseData.outcome },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-48">{value}</span>
                  </div>
                ))}
                <div>
                  <p className="text-xs text-gray-500 mb-2">{t.caseDetail.contextual}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {caseData.contextualElements.map((el) => (
                      <span key={el} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                        {el}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                {t.caseDetail.notes}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {caseData.notes}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSSRS tab */}
        <TabsContent value="cssrs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">{t.caseDetail.cssrsTitle} (C-SSRS)</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskBadgeColor(cssrs.riskLevel)}`}>
                {t.caseDetail.cssrsResult}: {t.risk[cssrs.riskLevel]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ideation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t.caseDetail.cssrsIdeation}
                </CardTitle>
                <p className="text-xs text-gray-500">Pensieri suicidari riferiti nell&apos;ultimo mese</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {ideationItems.map((item, idx) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      item.value ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                      <span className="text-xs text-gray-700">{item.label}</span>
                    </div>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                      item.value ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {item.value ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-xs font-bold">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Behavior */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  {t.caseDetail.cssrsBehavior}
                </CardTitle>
                <p className="text-xs text-gray-500">Comportamenti nell&apos;arco della vita</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {behaviorItems.map((item, idx) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      item.value ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                      <span className="text-xs text-gray-700">{item.label}</span>
                    </div>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                      item.value ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {item.value ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-xs font-bold">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Intensity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                {t.caseDetail.cssrsIntensity}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {intensityItems.map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                    <div className="flex flex-col-reverse gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-5 rounded-sm text-xs flex items-center justify-center font-bold transition-colors ${
                            item.value > 0 && level <= item.value
                              ? level <= 2 ? 'bg-green-200 text-green-800' :
                                level <= 3 ? 'bg-amber-200 text-amber-800' :
                                'bg-red-200 text-red-800'
                              : 'bg-gray-100 text-gray-300'
                          }`}
                        >
                          {level}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.value > 0 ? intensityLabels[item.value] : 'N/A'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinical notes */}
          {cssrs.notes && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <p className="text-xs font-semibold text-amber-800 mb-1">Note Cliniche C-SSRS</p>
                <p className="text-sm text-amber-900">{cssrs.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Intervention tab */}
        <TabsContent value="intervention" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  {t.caseDetail.interventionType}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {caseData.interventionType.map((int) => (
                    <div key={int} className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-gray-700">{int}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  {t.caseDetail.referrals}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {caseData.referrals.map((ref) => (
                    <div key={ref} className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-sm text-gray-700">{ref}</span>
                    </div>
                  ))}
                  {caseData.referrals.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">{t.common.noData}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t.caseDetail.outcome}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">{caseData.outcome}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-up tab */}
        <TabsContent value="followup" className="space-y-4">
          {caseFollowUps.length > 0 ? (
            caseFollowUps.map((fu: any) => (
              <Card key={fu.id} className={`${
                fu.status === 'overdue' ? 'border-red-200 bg-red-50/30' :
                fu.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                          fu.status === 'overdue' ? 'bg-red-100 text-red-800 border-red-200' :
                          fu.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {fu.status === 'overdue' ? t.followups.overdueLabel :
                           fu.status === 'completed' ? t.followups.statusCompleted : t.followups.statusPending}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskBadgeColor(fu.priority)}`}>
                          {t.followups.colPriority}: {t.risk[fu.priority as keyof typeof t.risk]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {lang === 'it' ? 'Programmato' : 'Scheduled'}: {formatDate(fu.scheduledDate)}
                        </span>
                        {fu.completedDate && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.followups.statusCompleted}: {formatDate(fu.completedDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {fu.operatorName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{fu.notes}</p>
                      {fu.outcome && (
                        <div className="mt-2 p-2 bg-white rounded border border-green-100">
                          <p className="text-xs font-semibold text-green-700">{t.caseDetail.outcome}:</p>
                          <p className="text-sm text-gray-700 mt-0.5">{fu.outcome}</p>
                        </div>
                      )}
                    </div>
                    {fu.status !== 'completed' && (
                      <Button size="sm" variant="outline" className="shrink-0">
                        {t.followups.markComplete}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">{t.followups.noFollowUps}</p>
            </div>
          )}
          <Button variant="outline" className="w-full">
            <Calendar className="w-4 h-4" />
            {lang === 'it' ? 'Aggiungi Follow-up' : 'Add Follow-up'}
          </Button>
        </TabsContent>

        {/* Audit log tab */}
        <TabsContent value="audit" className="space-y-3">
          {auditLog.length > 0 ? (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              {auditLog.map((entry: any) => (
                <div key={entry.id} className="flex gap-4 pl-4 pb-4 relative">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 border-2 border-white shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-gray-900">{entry.action}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{entry.userName}</span>
                    </div>
                    <p className="text-xs text-gray-600">{entry.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-400">{t.common.noData}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
