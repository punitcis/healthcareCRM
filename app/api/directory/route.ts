import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ServiceType } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const province = searchParams.get('province')
    const search = searchParams.get('search')

    const where: any = {}

    if (type && type !== 'all') {
      where.type = type as ServiceType
    }

    if (province && province !== 'all') {
      where.province = province
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { municipality: { contains: search, mode: 'insensitive' } },
        { province: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('GET /api/directory error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
