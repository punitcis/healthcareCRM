import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { CallStatus, CaseStatus, RiskLevel } from '@prisma/client'
import { normalizeCase } from '@/lib/db-helpers'

export async function GET(req: NextRequest) {
  try {
    // Active calls (active or on_hold)
    const activeCalls = await prisma.call.findMany({
      where: { status: { in: [CallStatus.active, CallStatus.on_hold] } },
      orderBy: { startTime: 'asc' },
    })

    // Queue calls (incoming)
    const queueCalls = await prisma.call.findMany({
      where: { status: CallStatus.incoming },
      orderBy: { startTime: 'asc' },
    })

    // Open high-risk cases
    const openHighRisk = await prisma.case.findMany({
      where: {
        status: { in: [CaseStatus.open, CaseStatus.follow_up, CaseStatus.escalated] },
        riskLevel: { in: [RiskLevel.high, RiskLevel.critical] },
      },
      include: { operator: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // Operator stats
    const operators = await prisma.user.findMany({
      where: { role: { in: ['operator', 'coordinator'] } },
      select: { id: true, name: true },
    })

    const operatorStats = await Promise.all(
      operators.map(async (op: any) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const callsToday = await prisma.case.count({
          where: {
            operatorId: op.id,
            createdAt: { gte: today },
          },
        })

        const highRiskCases = await prisma.case.count({
          where: {
            operatorId: op.id,
            riskLevel: { in: [RiskLevel.high, RiskLevel.critical] },
            status: { in: [CaseStatus.open, CaseStatus.follow_up] },
          },
        })

        const currentCall = activeCalls.find((c: any) => c.operatorId === op.id)

        return {
          id: op.id,
          name: op.name,
          status: currentCall ? 'busy' : 'available',
          callsToday,
          avgDuration: 24.0,
          highRiskCases,
          currentCallDuration: currentCall
            ? formatDuration(new Date(currentCall.startTime))
            : null,
        }
      })
    )

    return NextResponse.json({
      activeCalls: activeCalls.map((c: any) => ({
        ...c,
        startTime: c.startTime instanceof Date ? c.startTime.toISOString() : c.startTime,
        endTime: c.endTime instanceof Date ? c.endTime?.toISOString() : c.endTime,
      })),
      queueCalls: queueCalls.map((c: any) => ({
        ...c,
        startTime: c.startTime instanceof Date ? c.startTime.toISOString() : c.startTime,
      })),
      openHighRisk: openHighRisk.map(normalizeCase),
      operatorStats,
    })
  } catch (error) {
    console.error('GET /api/supervision error:', error)
    return NextResponse.json({ error: 'Failed to fetch supervision data' }, { status: 500 })
  }
}

function formatDuration(startTime: Date): string {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
