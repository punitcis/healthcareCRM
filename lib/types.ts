export type UserRole = 'operator' | 'coordinator' | 'supervisor' | 'admin'
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'
export type CallStatus = 'incoming' | 'active' | 'on-hold' | 'completed' | 'abandoned'
export type CaseStatus = 'open' | 'follow-up' | 'closed' | 'escalated'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  password?: string
}

export interface Call {
  id: string
  callerId: string
  callerAnonymous: boolean
  startTime: string
  endTime?: string
  duration?: number
  status: CallStatus
  operatorId: string
  operatorName: string
  riskLevel?: RiskLevel
  caseId?: string
}

export interface Case {
  id: string
  callId: string
  createdAt: string
  updatedAt: string
  status: CaseStatus
  operatorId: string
  operatorName: string
  // Socio-demographic
  ageRange: string
  gender: string
  region: string
  municipality: string
  // Call details
  primaryReason: string
  contextualElements: string[]
  // Assessment
  riskLevel: RiskLevel
  cssrsScore: CSSRSAssessment
  // Actions
  interventionType: string[]
  referrals: string[]
  // Follow-up
  followUpRequired: boolean
  followUpDate?: string
  notes: string
  outcome: string
}

export interface CSSRSAssessment {
  ideation: {
    passive: boolean
    activeNoIntent: boolean
    activeNoMethod: boolean
    activePlanNoIntent: boolean
    activePlanIntent: boolean
  }
  behavior: {
    preparatoryBehavior: boolean
    abortedAttempt: boolean
    interruptedAttempt: boolean
    actualAttempt: boolean
    nonSuicidalSelfInjury: boolean
  }
  intensity: {
    frequency: number
    duration: number
    controllability: number
    deterrents: number
    reasons: number
  }
  riskLevel: RiskLevel
  notes: string
}

export interface FollowUp {
  id: string
  caseId: string
  callerId: string
  scheduledDate: string
  completedDate?: string
  status: 'pending' | 'completed' | 'overdue' | 'cancelled'
  priority: RiskLevel
  operatorId: string
  operatorName: string
  notes: string
  outcome?: string
}

export interface Service {
  id: string
  name: string
  type: 'cmhc' | 'hospital' | 'emergency' | 'social' | 'police' | 'other'
  municipality: string
  province: string
  postalCode: string
  address: string
  phone: string
  email?: string
  hours: string
  available24h: boolean
}

export interface KPIData {
  totalCalls: number
  avgWaitTime: number
  abandonRate: number
  avgCallDuration: number
  highRiskCases: number
  followUpCompliance: number
  callsByHour: { hour: string; calls: number }[]
  callsByRisk: { level: string; count: number; color: string }[]
  callsTrend: { date: string; calls: number; abandoned: number }[]
  outcomeDistribution: { outcome: string; count: number; color: string }[]
}

export interface AuditEntry {
  id: string
  caseId: string
  timestamp: string
  userId: string
  userName: string
  action: string
  details: string
}
