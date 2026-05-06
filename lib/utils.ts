import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RiskLevel, CaseStatus, CallStatus } from './types'
import { format, formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRiskBadgeColor(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'moderate':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'Critico'
    case 'high':
      return 'Alto'
    case 'moderate':
      return 'Moderato'
    case 'low':
      return 'Basso'
    default:
      return level
  }
}

export function getCaseStatusLabel(status: CaseStatus): string {
  switch (status) {
    case 'open':
      return 'Aperto'
    case 'follow-up':
      return 'Follow-up'
    case 'closed':
      return 'Chiuso'
    case 'escalated':
      return 'Escalato'
    default:
      return status
  }
}

export function getCaseStatusColor(status: CaseStatus): string {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'follow-up':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'closed':
      return 'bg-gray-100 text-gray-600 border-gray-200'
    case 'escalated':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getCallStatusLabel(status: CallStatus): string {
  switch (status) {
    case 'incoming':
      return 'In arrivo'
    case 'active':
      return 'Attiva'
    case 'on-hold':
      return 'In attesa'
    case 'completed':
      return 'Completata'
    case 'abandoned':
      return 'Abbandonata'
    default:
      return status
  }
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: it })
}

export function formatDateShort(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: it })
}

export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: it })
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function getCallDuration(startTime: string): string {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffSecs = Math.floor((diffMs % 60000) / 1000)
  return `${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'operator':
      return 'Operatore'
    case 'coordinator':
      return 'Coordinatore'
    case 'supervisor':
      return 'Supervisore'
    case 'admin':
      return 'Amministratore'
    default:
      return role
  }
}

export function getServiceTypeLabel(type: string): string {
  switch (type) {
    case 'cmhc':
      return 'Centro Salute Mentale'
    case 'hospital':
      return 'Ospedale/PS'
    case 'emergency':
      return 'Emergenza'
    case 'social':
      return 'Servizi Sociali'
    case 'police':
      return 'Forze dell\'Ordine'
    case 'other':
      return 'Altro'
    default:
      return type
  }
}

export function getServiceTypeColor(type: string): string {
  switch (type) {
    case 'cmhc':
      return 'bg-blue-100 text-blue-800'
    case 'hospital':
      return 'bg-purple-100 text-purple-800'
    case 'emergency':
      return 'bg-red-100 text-red-800'
    case 'social':
      return 'bg-green-100 text-green-800'
    case 'police':
      return 'bg-indigo-100 text-indigo-800'
    case 'other':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
