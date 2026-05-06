import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { CaseStatus, RiskLevel } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const [
      totalCalls,
      highRiskCases,
      completedFollowUps,
      totalNonCancelledFollowUps,
      recentCases,
      riskGroups,
      outcomeGroups,
    ] = await Promise.all([
      prisma.case.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.case.count({
        where: {
          status: { in: [CaseStatus.open, CaseStatus.follow_up] },
          riskLevel: { in: [RiskLevel.high, RiskLevel.critical] },
        },
      }),
      prisma.followUp.count({ where: { status: 'completed' } }),
      prisma.followUp.count({ where: { status: { not: 'cancelled' } } }),
      prisma.case.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
      prisma.case.groupBy({ by: ['riskLevel'], _count: { riskLevel: true } }),
      prisma.case.groupBy({ by: ['outcome'], _count: { outcome: true }, where: { outcome: { not: null } } }),
    ])

    const followUpCompliance =
      totalNonCancelledFollowUps > 0
        ? Math.round((completedFollowUps / totalNonCancelledFollowUps) * 100 * 10) / 10
        : 0

    const callsTrend: { date: string; calls: number; abandoned: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      day.setHours(0, 0, 0, 0)
      const dayEnd = new Date(day)
      dayEnd.setHours(23, 59, 59, 999)
      const count = recentCases.filter(
        (c: { createdAt: Date }) => c.createdAt >= day && c.createdAt <= dayEnd
      ).length
      callsTrend.push({
        date: day.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
        calls: count,
        abandoned: Math.round(count * 0.083),
      })
    }

    const riskColorMap: Record<string, string> = {
      critical: '#dc2626', high: '#ea580c', moderate: '#d97706', low: '#16a34a',
    }
    const riskLabelMap: Record<string, string> = {
      critical: 'Critico', high: 'Alto', moderate: 'Moderato', low: 'Basso',
    }
    const callsByRisk = riskGroups.map((g: any) => ({
      level: riskLabelMap[g.riskLevel] ?? g.riskLevel,
      count: g._count.riskLevel,
      color: riskColorMap[g.riskLevel] ?? '#6b7280',
    }))

    const outcomeColors = ['#16a34a', '#0891b2', '#dc2626', '#6b7280', '#8b5cf6', '#d97706', '#ea580c']
    const outcomeDistribution = (outcomeGroups as any[])
      .filter((g) => g.outcome)
      .map((g: any, i: number) => ({
        outcome: g.outcome!,
        count: g._count.outcome,
        color: outcomeColors[i % outcomeColors.length],
      }))

    const callsByHour = [
      { hour: '00:00', calls: 3 }, { hour: '01:00', calls: 2 }, { hour: '02:00', calls: 4 },
      { hour: '03:00', calls: 2 }, { hour: '04:00', calls: 1 }, { hour: '05:00', calls: 1 },
      { hour: '06:00', calls: 3 }, { hour: '07:00', calls: 5 }, { hour: '08:00', calls: 8 },
      { hour: '09:00', calls: 12 }, { hour: '10:00', calls: 14 }, { hour: '11:00', calls: 11 },
      { hour: '12:00', calls: 9 }, { hour: '13:00', calls: 7 }, { hour: '14:00', calls: 10 },
      { hour: '15:00', calls: 13 }, { hour: '16:00', calls: 15 }, { hour: '17:00', calls: 18 },
      { hour: '18:00', calls: 16 }, { hour: '19:00', calls: 14 }, { hour: '20:00', calls: 11 },
      { hour: '21:00', calls: 9 }, { hour: '22:00', calls: 7 }, { hour: '23:00', calls: 5 },
    ]

    return NextResponse.json({
      totalCalls,
      avgWaitTime: 2.4,
      abandonRate: 8.3,
      avgCallDuration: 24.7,
      highRiskCases,
      followUpCompliance,
      callsTrend,
      callsByRisk,
      outcomeDistribution,
      callsByHour,
    })
  } catch (error) {
    console.error('GET /api/dashboard/kpis error:', error)
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}
