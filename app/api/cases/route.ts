import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { toDbCaseStatus, fromDbCaseStatus, normalizeCase } from '@/lib/db-helpers'
import { RiskLevel } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const riskLevel = searchParams.get('riskLevel')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = toDbCaseStatus(status)
    }

    if (riskLevel && riskLevel !== 'all') {
      where.riskLevel = riskLevel as RiskLevel
    }

    if (search) {
      where.OR = [
        { primaryReason: { contains: search, mode: 'insensitive' } },
        { municipality: { contains: search, mode: 'insensitive' } },
      ]
    }

    const cases = await prisma.case.findMany({
      where,
      include: { operator: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const normalized = cases.map(normalizeCase)

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('GET /api/cases error:', error)
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      operatorId,
      operatorName,
      ageRange,
      gender,
      region,
      municipality,
      primaryReason,
      contextualElements = [],
      riskLevel = 'low',
      cssrsScore,
      interventionType = [],
      referrals = [],
      followUpRequired = false,
      followUpDate,
      notes,
      outcome,
      status = 'open',
    } = body

    const newCase = await prisma.case.create({
      data: {
        operatorId,
        ageRange,
        gender,
        region,
        municipality,
        primaryReason,
        contextualElements,
        riskLevel: riskLevel as RiskLevel,
        cssrsData: cssrsScore ?? null,
        interventionTypes: interventionType,
        referrals,
        followUpRequired,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes,
        outcome,
        status: toDbCaseStatus(status),
      },
      include: { operator: { select: { name: true } } },
    })

    // Create audit log
    if (operatorId && operatorName) {
      await prisma.auditLog.create({
        data: {
          caseId: newCase.id,
          userId: operatorId,
          userName: operatorName,
          action: 'Creazione caso',
          details: 'Caso creato',
        },
      })
    }

    return NextResponse.json(normalizeCase(newCase), { status: 201 })
  } catch (error) {
    console.error('POST /api/cases error:', error)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
