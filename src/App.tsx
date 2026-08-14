import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { LoginForm } from './features/auth/LoginForm'
import { AnalyticsPage } from './features/charts/AnalyticsPage'
import { TransactionsPage } from './features/transactions/TransactionsPage'
import { supabase } from './lib/supabaseClient'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions')
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    let isMounted = true

    const loadCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (!isMounted) {
        return
      }

      useAuthStore.setState({
        user: error ? null : data.user,
      })

      setIsAuthBootstrapping(false)
    }

    void loadCurrentUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.setState({
        user: session?.user ?? null,
      })
      setIsAuthBootstrapping(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (isAuthBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
        <p className="text-sm text-surface-600">Проверяем авторизацию...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
        <LoginForm />
      </div>
    )
  }

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'transactions' ? <TransactionsPage /> : <AnalyticsPage />}
    </AppLayout>
  )
}

export default App
