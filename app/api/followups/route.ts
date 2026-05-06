import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { FollowUpStatus, RiskLevel } from '@prisma/client'

function normalizeFollowUp(fu: any) {
  return {
    id: fu.id,
    caseId: fu.caseId,
    callerId: fu.callerId ?? '',
    scheduledDate: fu.scheduledDate instanceof Date ? fu.scheduledDate.toISOString() : fu.scheduledDate,
    completedDate: fu.completedDate instanceof Date ? fu.completedDate.toISOString() : fu.completedDate,
    status: fu.status,
    priority: fu.priority,
    operatorId: fu.operatorId,
    operatorName: fu.operator?.name ?? '',
    notes: fu.notes ?? '',
    outcome: fu.outcome ?? undefined,
    createdAt: fu.createdAt instanceof Date ? fu.createdAt.toISOString() : fu.createdAt,
    updatedAt: fu.updatedAt instanceof Date ? fu.updatedAt.toISOString() : fu.updatedAt,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status as FollowUpStatus
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        operator: { select: { name: true } },
        case: { select: { id: true, primaryReason: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    })

    return NextResponse.json(followUps.map(normalizeFollowUp))
  } catch (error) {
    console.error('GET /api/followups error:', error)
    return NextResponse.json({ error: 'Failed to fetch follow-ups' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      caseId,
      callerId,
      scheduledDate,
      status = 'pending',
      priority = 'low',
      operatorId,
      notes,
    } = body

    const followUp = await prisma.followUp.create({
      data: {
        caseId,
        callerId,
        scheduledDate: new Date(scheduledDate),
        status: status as FollowUpStatus,
        priority: priority as RiskLevel,
        operatorId,
        notes,
      },
      include: { operator: { select: { name: true } } },
    })

    return NextResponse.json(normalizeFollowUp(followUp), { status: 201 })
  } catch (error) {
    console.error('POST /api/followups error:', error)
    return NextResponse.json({ error: 'Failed to create follow-up' }, { status: 500 })
  }
}
