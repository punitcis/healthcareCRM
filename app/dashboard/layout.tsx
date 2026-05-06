import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { UserRole } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = ((session.user as { role?: string }).role || 'operator') as UserRole
  const userName = session.user.name || 'Utente'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userRole={userRole} activeCalls={3} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          userName={userName}
          userRole={userRole}
          alerts={3}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
