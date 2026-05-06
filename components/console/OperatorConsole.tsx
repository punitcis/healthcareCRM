'use client'

import { useState, useEffect } from 'react'
import {
  Phone,
  PhoneOff,
  PhoneCall,
  PhoneMissed,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Shield,
  ArrowUp,
  Pause,
  Play,
  CheckCircle,
  Circle,
  Mic,
  MicOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockCalls, mockCases } from '@/lib/mock-data'
import { Call, RiskLevel } from '@/lib/types'
import { getRiskBadgeColor, getCallDuration } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

export default function OperatorConsole() {
  const [operatorStatus, setOperatorStatus] = useState('available')
  const [activeCallId, setActiveCallId] = useState<string | null>('c001')
  const [notes, setNotes] = useState('')
  const [liveTimer, setLiveTimer] = useState('00:00')
  const [muted, setMuted] = useState(false)
  const [currentStep, setCurrentStep] = useState<'wait' | 'intake' | 'assess' | 'intervene'>('intake')
  const { t, lang } = useLanguage()

  const statusOptions = [
    { value: 'available', label: t.console.statusAvailable, color: 'bg-green-500' },
    { value: 'busy', label: t.console.statusBusy, color: 'bg-red-500' },
    { value: 'break', label: t.console.statusBreak, color: 'bg-amber-500' },
    { value: 'offline', label: lang === 'it' ? 'Offline' : 'Offline', color: 'bg-gray-400' },
  ]

  const activeCalls = mockCalls.filter((c) => c.status === 'active' || c.status === 'on-hold' || c.status === 'incoming')
  const activeCall = activeCalls.find((c) => c.id === activeCallId)
  const activeCase = activeCall?.caseId ? mockCases.find((c) => c.id === activeCall.caseId) : null

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeCall) {
        setLiveTimer(getCallDuration(activeCall.startTime))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [activeCall])

  const currentStatusObj = statusOptions.find((s) => s.value === operatorStatus)

  const getCallStatusLabel = (status: string) => {
    if (status === 'incoming') return t.console.incoming
    if (status === 'active') return t.console.active
    return t.console.onHold
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top status bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">{lang === 'it' ? 'Stato operatore:' : 'Operator status:'}</span>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${currentStatusObj?.color}`} />
            <Select value={operatorStatus} onValueChange={setOperatorStatus}>
              <SelectTrigger className="w-36 h-8 text-sm border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{lang === 'it' ? 'In coda:' : 'In queue:'} <strong className="text-red-600">2</strong></span>
          <span>{lang === 'it' ? 'Attiva:' : 'Active:'} <strong className="text-green-600">1</strong></span>
          <span>{lang === 'it' ? 'In attesa:' : 'On hold:'} <strong className="text-amber-600">1</strong></span>
        </div>
      </div>

      {/* Main console layout */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left: Call queue */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.console.callQueue}</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeCalls.map((call) => {
              const isSelected = call.id === activeCallId
              return (
                <button
                  key={call.id}
                  onClick={() => setActiveCallId(call.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {call.status === 'incoming' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                      {call.status === 'active' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      {call.status === 'on-hold' && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                      <span className="text-xs font-semibold text-gray-800 truncate max-w-28">
                        {call.callerId}
                      </span>
                    </div>
                    {call.riskLevel && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${getRiskBadgeColor(call.riskLevel)}`}>
                        {t.risk[call.riskLevel][0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      call.status === 'incoming' ? 'bg-green-100 text-green-700' :
                      call.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {getCallStatusLabel(call.status)}
                    </span>
                    <span className="text-xs text-gray-400">{getCallDuration(call.startTime)}</span>
                  </div>
                  {call.operatorName && (
                    <p className="text-xs text-gray-400 mt-1 truncate">Op: {call.operatorName}</p>
                  )}
                </button>
              )
            })}

            {activeCalls.length === 0 && (
              <div className="text-center py-8">
                <Phone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">{t.console.noActiveCalls}</p>
              </div>
            )}
          </div>
        </div>

        {/* Center: Active call */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeCall ? (
            <>
              {/* Call header */}
              <div className={`px-6 py-4 border-b border-gray-200 ${
                activeCall.riskLevel === 'critical' ? 'bg-red-50' :
                activeCall.riskLevel === 'high' ? 'bg-orange-50' : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                      <User className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                          {activeCall.callerAnonymous ? (lang === 'it' ? 'Chiamante Anonimo' : 'Anonymous Caller') : activeCall.callerId}
                        </h2>
                        {activeCall.riskLevel && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(activeCall.riskLevel)}`}>
                            {t.risk[activeCall.riskLevel]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <div className="flex items-center gap-1 text-blue-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-sm font-mono font-bold">{liveTimer}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {getCallStatusLabel(activeCall.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMuted(!muted)}
                      className={`p-2 rounded-lg border transition-colors ${muted ? 'bg-red-100 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      title={muted ? (lang === 'it' ? 'Riattiva microfono' : 'Unmute microphone') : (lang === 'it' ? 'Silenzia microfono' : 'Mute microphone')}
                    >
                      {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <Button variant="warning" size="sm">
                      <Pause className="w-4 h-4" />
                      {t.console.hold}
                    </Button>
                    <Button variant="destructive" size="sm">
                      <PhoneOff className="w-4 h-4" />
                      {t.console.endCall}
                    </Button>
                  </div>
                </div>

                {/* Workflow steps */}
                <div className="flex items-center gap-2 mt-4">
                  {[
                    { id: 'intake', label: lang === 'it' ? 'Intake' : 'Intake', num: 1 },
                    { id: 'assess', label: lang === 'it' ? 'Valutazione' : 'Assessment', num: 2 },
                    { id: 'intervene', label: lang === 'it' ? 'Intervento' : 'Intervention', num: 3 },
                  ].map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentStep(step.id as typeof currentStep)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          currentStep === step.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        <span className={`flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold ${
                          currentStep === step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {step.num}
                        </span>
                        {step.label}
                      </button>
                      {idx < 2 && <div className="w-6 h-px bg-gray-300" />}
                    </div>
                  ))}
                  <div className="ml-auto">
                    <Button variant="warning" size="sm">
                      <ArrowUp className="w-4 h-4" />
                      {t.console.escalate}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Call body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Notes area */}
                <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                  {/* Quick info cards */}
                  {activeCase && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium">{lang === 'it' ? "Fascia d'età" : 'Age range'}</p>
                        <p className="text-sm font-bold text-blue-900 mt-0.5">{activeCase.ageRange} {lang === 'it' ? 'anni' : 'yrs'}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium">{lang === 'it' ? 'Genere' : 'Gender'}</p>
                        <p className="text-sm font-bold text-blue-900 mt-0.5">{activeCase.gender}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium">{lang === 'it' ? 'Comune' : 'Municipality'}</p>
                        <p className="text-sm font-bold text-blue-900 mt-0.5">{activeCase.municipality}</p>
                      </div>
                    </div>
                  )}

                  {/* Intake form quick fields */}
                  {currentStep === 'intake' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{lang === 'it' ? 'Motivo principale' : 'Primary reason'}</Label>
                        <Select defaultValue={activeCase?.primaryReason || ''}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder={lang === 'it' ? 'Seleziona...' : 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ideazione suicidaria">Ideazione suicidaria</SelectItem>
                            <SelectItem value="Crisi depressiva acuta">Crisi depressiva acuta</SelectItem>
                            <SelectItem value="Violenza domestica">Violenza domestica</SelectItem>
                            <SelectItem value="Ansia grave">Ansia grave</SelectItem>
                            <SelectItem value="Autolesionismo">Autolesionismo</SelectItem>
                            <SelectItem value="Dipendenza">Dipendenza</SelectItem>
                            <SelectItem value="Solitudine">Solitudine</SelectItem>
                            <SelectItem value="Altro">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{lang === 'it' ? "Fascia d'età" : 'Age range'}</Label>
                        <Select defaultValue={activeCase?.ageRange || ''}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder={lang === 'it' ? 'Seleziona...' : 'Select...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="< 15">{lang === 'it' ? 'Sotto 15 anni' : 'Under 15'}</SelectItem>
                            <SelectItem value="15-17">15-17 {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                            <SelectItem value="18-24">18-24 {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                            <SelectItem value="25-34">25-34 {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                            <SelectItem value="35-44">35-44 {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                            <SelectItem value="45-54">45-54 {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                            <SelectItem value="55-64">55-64 {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                            <SelectItem value="65+">65+ {lang === 'it' ? 'anni' : 'yrs'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {currentStep === 'assess' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-amber-700" />
                        <h4 className="text-sm font-semibold text-amber-800">{lang === 'it' ? 'Valutazione C-SSRS Rapida' : 'Quick C-SSRS Assessment'}</h4>
                      </div>
                      <div className="space-y-2">
                        {[
                          lang === 'it' ? 'Pensieri di voler essere morto/a?' : 'Thoughts of wanting to be dead?',
                          lang === 'it' ? 'Pensieri di farsi del male (senza piano)?' : 'Thoughts of self-harm (no plan)?',
                          lang === 'it' ? 'Pensieri attivi con intenzione?' : 'Active thoughts with intent?',
                          lang === 'it' ? 'Ha un piano specifico?' : 'Has a specific plan?',
                          lang === 'it' ? 'Ha accesso ai mezzi?' : 'Has access to means?',
                        ].map((q, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                            <span className="text-xs text-gray-700 flex-1 mr-3">{q}</span>
                            <div className="flex gap-2">
                              <button className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium">{lang === 'it' ? 'Sì' : 'Yes'}</button>
                              <button className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium">No</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep === 'intervene' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                        <h4 className="text-sm font-semibold text-green-800">{lang === 'it' ? 'Interventi Applicati' : 'Applied Interventions'}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(lang === 'it' ? ['Ascolto attivo', 'Piano di sicurezza', 'Psicoeducazione', 'Riferimento servizi', 'Attivazione emergenza', 'Supporto emotivo'] :
                          ['Active listening', 'Safety plan', 'Psychoeducation', 'Service referral', 'Emergency activation', 'Emotional support']).map((int) => (
                          <label key={int} className="flex items-center gap-2 p-2 bg-white rounded border border-green-100 cursor-pointer hover:bg-green-50">
                            <input type="checkbox" className="rounded border-gray-300 text-green-600" />
                            <span className="text-xs text-gray-700">{int}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live notes */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{lang === 'it' ? 'Note in tempo reale' : 'Real-time notes'}</Label>
                      <span className="text-xs text-gray-400">{notes.length} {lang === 'it' ? 'caratteri' : 'chars'}</span>
                    </div>
                    <Textarea
                      placeholder={t.console.notesPlaceholder}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[140px] text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Right panel: case quick view */}
                <div className="w-52 border-l border-gray-200 p-3 overflow-y-auto bg-gray-50">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {lang === 'it' ? 'Dossier Rapido' : 'Quick Dossier'}
                  </h4>
                  {activeCase ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">{lang === 'it' ? 'Caso' : 'Case'}</p>
                        <p className="text-xs font-mono font-bold text-blue-800">#{activeCase.id.slice(-6)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{lang === 'it' ? 'Regione' : 'Region'}</p>
                        <p className="text-xs font-medium text-gray-800">{activeCase.region}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{lang === 'it' ? 'Rischio C-SSRS' : 'C-SSRS Risk'}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${getRiskBadgeColor(activeCase.riskLevel)}`}>
                          {t.risk[activeCase.riskLevel]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{lang === 'it' ? 'Elementi contestuali' : 'Contextual elements'}</p>
                        {activeCase.contextualElements.map((el) => (
                          <span key={el} className="block text-xs text-gray-700 py-0.5 border-b border-gray-100 last:border-0">
                            • {el}
                          </span>
                        ))}
                      </div>
                      {activeCase.referrals.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">{lang === 'it' ? 'Riferimenti' : 'Referrals'}</p>
                          {activeCase.referrals.map((ref) => (
                            <span key={ref} className="block text-xs text-cyan-700 py-0.5">
                              {ref}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">{lang === 'it' ? 'Nessun caso associato' : 'No associated case'}</p>
                      <Button size="sm" className="mt-2 text-xs" variant="outline">
                        {lang === 'it' ? 'Crea caso' : 'Create case'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Phone className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-400">{t.console.noCallSelected}</h3>
                <p className="text-sm text-gray-400 mt-1">{t.console.noCallDesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts guide */}
      <div className="px-6 py-2 bg-gray-900 text-gray-400 border-t border-gray-800 flex items-center gap-6 text-xs">
        <span className="text-gray-500 font-medium">{lang === 'it' ? 'Scorciatoie:' : 'Shortcuts:'}</span>
        {[
          { key: 'Ctrl+1', action: 'Intake' },
          { key: 'Ctrl+2', action: lang === 'it' ? 'Valutazione' : 'Assessment' },
          { key: 'Ctrl+3', action: lang === 'it' ? 'Intervento' : 'Intervention' },
          { key: 'Ctrl+H', action: t.console.hold },
          { key: 'Ctrl+E', action: t.console.escalate },
          { key: 'Ctrl+S', action: lang === 'it' ? 'Salva note' : 'Save notes' },
          { key: 'Ctrl+Q', action: t.console.endCall },
        ].map(({ key, action }) => (
          <span key={key} className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300 font-mono text-xs">{key}</kbd>
            <span>{action}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
