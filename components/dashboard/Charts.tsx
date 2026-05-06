'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KPIData } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface ChartsProps {
  data: KPIData
}

export function CallsTrendChart({ data }: ChartsProps) {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t.dashboard.callsTrendTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.callsTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="calls"
              stroke="#1e40af"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#1e40af' }}
              name={t.dashboard.callsTotalLabel}
            />
            <Line
              type="monotone"
              dataKey="abandoned"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 3, fill: '#dc2626' }}
              strokeDasharray="5 5"
              name={t.dashboard.callsAbandonedLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function RiskDistributionChart({ data }: ChartsProps) {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t.dashboard.riskDistTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data.callsByRisk}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="count"
              nameKey="level"
            >
              {data.callsByRisk.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function CallsByHourChart({ data }: ChartsProps) {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t.dashboard.callsByHourTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data.callsByHour.filter((_, i) => i % 2 === 0)}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="calls" fill="#0891b2" radius={[3, 3, 0, 0]} name={t.dashboard.callsByHourLabel} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function OutcomeDistributionChart({ data }: ChartsProps) {
  const { t } = useLanguage()
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t.dashboard.outcomeDistTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data.outcomeDistribution}
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              nameKey="outcome"
            >
              {data.outcomeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
