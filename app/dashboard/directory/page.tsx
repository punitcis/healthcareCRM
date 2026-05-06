'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Search,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Building2,
  Hospital,
  AlertCircle,
  Shield,
  Users,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getServiceTypeColor } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { Service } from '@/lib/types'

const serviceIcons: Record<string, React.ElementType> = {
  cmhc: Building2,
  hospital: Hospital,
  emergency: AlertCircle,
  social: Users,
  police: Shield,
  other: BookOpen,
}

export default function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [provinceFilter, setProvinceFilter] = useState('all')
  const [only24h, setOnly24h] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLanguage()

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (provinceFilter !== 'all') params.set('province', provinceFilter)
    if (search) params.set('search', search)
    fetch(`/api/directory?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [typeFilter, provinceFilter, search])

  const provinces = [...new Set(services.map((s) => s.province))].sort()

  const filtered = useMemo(() => {
    let result = [...services]
    if (only24h) result = result.filter((s) => s.available24h)
    return result
  }, [services, only24h])

  const copyPhone = async (phone: string) => {
    await navigator.clipboard.writeText(phone)
    setCopiedPhone(phone)
    setTimeout(() => setCopiedPhone(null), 2000)
  }

  const stats = {
    total: services.length,
    h24: services.filter((s) => s.available24h).length,
    cmhc: services.filter((s) => s.type === 'cmhc').length,
    emergency: services.filter((s) => s.type === 'emergency' || s.type === 'hospital').length,
  }

  const getServiceTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      cmhc: t.directory.typeCMHC,
      hospital: t.directory.typeHospital,
      emergency: t.directory.typeEmergency,
      social: t.directory.typeSocial,
      police: t.directory.typePolice,
      other: t.directory.typeOther,
    }
    return labels[type] ?? type
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.directory.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} {lang === 'it' ? 'servizi trovati — Riferimenti locali e nazionali' : 'services found — Local and national referrals'}
          </p>
        </div>
        <Button variant="outline">
          <BookOpen className="w-4 h-4" />
          {lang === 'it' ? 'Aggiungi Servizio' : 'Add Service'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: lang === 'it' ? 'Totale Servizi' : 'Total Services', value: stats.total, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
          { label: lang === 'it' ? 'Attivi H24' : 'Active H24', value: stats.h24, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
          { label: lang === 'it' ? 'CSM/Psichiatria' : 'CMHC/Psychiatry', value: stats.cmhc, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
          { label: lang === 'it' ? 'Emergenza/Ospedali' : 'Emergency/Hospitals', value: stats.emergency, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
        ].map((s) => (
          <div key={s.label} className={`p-3 rounded-lg border ${s.bg} ${s.border}`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick access: emergency numbers */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          {lang === 'it' ? 'Numeri di Emergenza Rapida' : 'Quick Emergency Numbers'}
        </p>
        <div className="flex gap-4 flex-wrap">
          {[
            { name: lang === 'it' ? '118 - Emergenza Sanitaria' : '118 - Medical Emergency', phone: '118' },
            { name: lang === 'it' ? '112 - Carabinieri/Emergenza' : '112 - Emergency', phone: '112' },
            { name: lang === 'it' ? '113 - Polizia di Stato' : '113 - Police', phone: '113' },
            { name: 'Telefono Amico', phone: '02 2327 2327' },
          ].map((em) => (
            <button
              key={em.phone}
              onClick={() => copyPhone(em.phone)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 rounded-lg hover:border-red-400 transition-colors group"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <div className="text-left">
                <p className="text-xs font-bold text-red-700">{em.phone}</p>
                <p className="text-xs text-gray-500">{em.name}</p>
              </div>
              {copiedPhone === em.phone ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t.directory.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t.directory.filterType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.directory.allTypes}</SelectItem>
            <SelectItem value="cmhc">{t.directory.typeCMHC}</SelectItem>
            <SelectItem value="hospital">{t.directory.typeHospital}</SelectItem>
            <SelectItem value="emergency">{t.directory.typeEmergency}</SelectItem>
            <SelectItem value="social">{t.directory.typeSocial}</SelectItem>
            <SelectItem value="police">{t.directory.typePolice}</SelectItem>
            <SelectItem value="other">{t.directory.typeOther}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={provinceFilter} onValueChange={setProvinceFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t.directory.filterProvince} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{lang === 'it' ? 'Tutte le prov.' : 'All prov.'}</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="h24" checked={only24h} onCheckedChange={setOnly24h} />
          <Label htmlFor="h24" className="text-sm text-gray-600 cursor-pointer">{t.directory.filter24h}</Label>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((service) => {
          const TypeIcon = serviceIcons[service.type] || Building2
          return (
            <Card key={service.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                    service.type === 'emergency' || service.type === 'police'
                      ? 'bg-red-100'
                      : service.type === 'hospital'
                      ? 'bg-purple-100'
                      : service.type === 'cmhc'
                      ? 'bg-blue-100'
                      : 'bg-green-100'
                  }`}>
                    <TypeIcon className={`w-5 h-5 ${
                      service.type === 'emergency' || service.type === 'police'
                        ? 'text-red-700'
                        : service.type === 'hospital'
                        ? 'text-purple-700'
                        : service.type === 'cmhc'
                        ? 'text-blue-700'
                        : 'text-green-700'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getServiceTypeColor(service.type)}`}>
                        {getServiceTypeLabel(service.type)}
                      </span>
                      {service.available24h && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                          {t.directory.available24h}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                    <span>{service.address}, {service.municipality} ({service.province})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span>{service.hours}</span>
                  </div>
                  {service.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{service.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => copyPhone(service.phone)}
                    className="flex items-center gap-1.5 flex-1 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group/phone"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-sm font-bold text-blue-800">{service.phone}</span>
                    {copiedPhone === service.phone ? (
                      <Check className="w-3 h-3 text-green-600 ml-auto" />
                    ) : (
                      <Copy className="w-3 h-3 text-blue-400 ml-auto opacity-0 group-hover/phone:opacity-100" />
                    )}
                  </button>
                  <Button size="sm" variant="outline" className="text-xs shrink-0">
                    {t.directory.referPatient}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">{t.directory.noServices}</p>
            <p className="text-xs text-gray-400 mt-1">{lang === 'it' ? 'Modifica i filtri di ricerca' : 'Modify the search filters'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
