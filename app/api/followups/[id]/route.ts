import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { FollowUpStatus } from '@prisma/client'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const { status, outcome, completedDate, scheduledDate, notes } = body

    const updateData: any = {}
    if (status !== undefined) updateData.status = status as FollowUpStatus
    if (outcome !== undefined) updateData.outcome = outcome
    if (completedDate !== undefined) updateData.completedDate = completedDate ? new Date(completedDate) : null
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate)
    if (notes !== undefined) updateData.notes = notes

    const updated = await prisma.followUp.update({
      where: { id },
      data: updateData,
      include: { operator: { select: { name: true } } },
    })

    return NextResponse.json({
      ...updated,
      operatorName: updated.operator?.name ?? '',
      scheduledDate: updated.scheduledDate.toISOString(),
      completedDate: updated.completedDate?.toISOString(),
    })
  } catch (error) {
    console.error('PUT /api/followups/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update follow-up' }, { status: 500 })
  }
}
