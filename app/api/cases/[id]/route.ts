import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { toDbCaseStatus, fromDbCaseStatus, normalizeCase } from '@/lib/db-helpers'
import { RiskLevel } from '@prisma/client'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        operator: { select: { name: true } },
        auditLogs: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        followUps: {
          include: { operator: { select: { name: true } } },
          orderBy: { scheduledDate: 'asc' },
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const normalized = {
      ...normalizeCase(caseData),
      auditLogs: caseData.auditLogs.map((log: any) => ({
        id: log.id,
        caseId: log.caseId,
        timestamp: log.createdAt.toISOString(),
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        details: log.details ?? '',
      })),
      followUps: caseData.followUps.map((fu: any) => ({
        ...fu,
        operatorName: fu.operator?.name ?? '',
        scheduledDate: fu.scheduledDate.toISOString(),
        completedDate: fu.completedDate?.toISOString(),
        createdAt: fu.createdAt.toISOString(),
        updatedAt: fu.updatedAt.toISOString(),
      })),
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('GET /api/cases/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch case' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const {
      operatorId,
      operatorName,
      ageRange,
      gender,
      region,
      municipality,
      primaryReason,
      contextualElements,
      riskLevel,
      cssrsScore,
      interventionType,
      referrals,
      followUpRequired,
      followUpDate,
      notes,
      outcome,
      status,
      action,
      details,
    } = body

    const updateData: any = {}
    if (ageRange !== undefined) updateData.ageRange = ageRange
    if (gender !== undefined) updateData.gender = gender
    if (region !== undefined) updateData.region = region
    if (municipality !== undefined) updateData.municipality = municipality
    if (primaryReason !== undefined) updateData.primaryReason = primaryReason
    if (contextualElements !== undefined) updateData.contextualElements = contextualElements
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel as RiskLevel
    if (cssrsScore !== undefined) updateData.cssrsData = cssrsScore
    if (interventionType !== undefined) updateData.interventionTypes = interventionType
    if (referrals !== undefined) updateData.referrals = referrals
    if (followUpRequired !== undefined) updateData.followUpRequired = followUpRequired
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate ? new Date(followUpDate) : null
    if (notes !== undefined) updateData.notes = notes
    if (outcome !== undefined) updateData.outcome = outcome
    if (status !== undefined) updateData.status = toDbCaseStatus(status)

    const updated = await prisma.case.update({
      where: { id },
      data: updateData,
      include: { operator: { select: { name: true } } },
    })

    // Create audit log
    if (operatorId && operatorName) {
      await prisma.auditLog.create({
        data: {
          caseId: id,
          userId: operatorId,
          userName: operatorName,
          action: action ?? 'Aggiornamento caso',
          details: details ?? 'Caso aggiornato',
        },
      })
    }

    return NextResponse.json(normalizeCase(updated))
  } catch (error) {
    console.error('PUT /api/cases/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}
