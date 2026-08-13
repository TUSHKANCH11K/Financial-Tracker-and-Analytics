import { useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { AnalyticsPage } from './features/charts/AnalyticsPage'
import { TransactionsPage } from './features/transactions/TransactionsPage'

function App() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions')

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'transactions' ? <TransactionsPage /> : <AnalyticsPage />}
    </AppLayout>
  )
}

export default App
