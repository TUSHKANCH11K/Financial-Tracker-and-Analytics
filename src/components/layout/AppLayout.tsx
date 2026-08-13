import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type AppLayoutProps = {
  children: ReactNode
  activeTab: 'transactions' | 'analytics'
  onTabChange: (tab: 'transactions' | 'analytics') => void
}

export function AppLayout({ children, activeTab, onTabChange }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
