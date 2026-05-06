import { CaseStatus } from '@prisma/client'

/**
 * Convert TypeScript CaseStatus ('follow-up') to Prisma enum ('follow_up')
 */
export function toDbCaseStatus(status: string): CaseStatus {
  if (status === 'follow-up') return CaseStatus.follow_up
  return status as CaseStatus
}

/**
 * Convert Prisma CaseStatus ('follow_up') to TypeScript ('follow-up')
 */
export function fromDbCaseStatus(status: CaseStatus): string {
  if (status === CaseStatus.follow_up) return 'follow-up'
  return status
}

/**
 * Normalize a case object from DB to match the TypeScript type
 */
export function normalizeCase(c: any) {
  return {
    ...c,
    status: fromDbCaseStatus(c.status),
    operatorName: c.operator?.name ?? '',
    // map DB fields to TypeScript fields
    interventionType: c.interventionTypes ?? [],
    cssrsScore: c.cssrsData ?? null,
    callId: '',
  }
}
