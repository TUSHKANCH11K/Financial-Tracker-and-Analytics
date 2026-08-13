import { useMemo, useState } from 'react'
import { useTransactionStore } from '../../store/useTransactionStore'
import { TransactionFilters, type TransactionFilterState } from './TransactionFilters'
import { TransactionForm } from './TransactionForm'
import { TransactionList } from './TransactionList'

const defaultFilters: TransactionFilterState = {
  type: 'all',
  category: 'all',
  month: 'all',
}

export function TransactionsPage() {
  const transactions = useTransactionStore((state) => state.transactions)
  const [filters, setFilters] = useState<TransactionFilterState>(defaultFilters)

  const visibleTransactions = useMemo(() => {
    return [...transactions]
      .filter((transaction) => {
        if (filters.type !== 'all' && transaction.type !== filters.type) {
          return false
        }

        if (filters.category !== 'all' && transaction.category !== filters.category) {
          return false
        }

        if (filters.month !== 'all' && !transaction.date.startsWith(filters.month)) {
          return false
        }

        return true
      })
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
  }, [filters, transactions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary-700">Операции</p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">Учёт транзакций</h2>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-surface-900">Новая операция</h3>
          <TransactionForm />
        </section>

        <section className="space-y-4">
          <TransactionFilters transactions={transactions} onChange={setFilters} />
          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
            <TransactionList transactions={visibleTransactions} />
          </div>
        </section>
      </div>
    </div>
  )
}
