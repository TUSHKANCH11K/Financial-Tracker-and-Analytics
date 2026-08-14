import { useMemo, useState } from 'react'
import { useTransactionStore } from '../../store/useTransactionStore'
import { aggregateByCategory, aggregateByDay } from '../../lib/aggregations'
import { CategoryPieChart } from './CategoryPieChart'
import { MonthlyTrendChart } from './MonthlyTrendChart'

const monthOptions = [
  'all',
  ...Array.from({ length: 12 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - index)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }),
]

export function AnalyticsPage() {
  const transactions = useTransactionStore((state) => state.transactions)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const chartMonth = selectedMonth === 'all' ? undefined : selectedMonth

  const categoryData = useMemo(
    () => aggregateByCategory(transactions, chartMonth),
    [chartMonth, transactions],
  )

  const trendData = useMemo(
    () => aggregateByDay(transactions, chartMonth),
    [chartMonth, transactions],
  )

  const monthLabel = (month: string) => {
    if (month === 'all') return 'Все время'
    const [year, monthNumber] = month.split('-')
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(Number(year), Number(monthNumber) - 1, 1))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary-700">Аналитика</p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">Динамика и категории</h2>
        </div>

        <label className="flex items-center gap-2 text-sm text-surface-700">
          <span>Месяц</span>
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-lg border border-surface-300 bg-white px-3 py-2 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">Все время</option>
            {monthOptions.slice(1).map((month) => (
              <option key={month} value={month}>
                {monthLabel(month)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!transactions.length || (!categoryData.length && !trendData.length) ? (
        <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-8 text-center text-sm text-surface-600">
          Нет транзакций за выбранный месяц
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <CategoryPieChart data={categoryData} />
          <MonthlyTrendChart data={trendData} />
        </div>
      )}
    </div>
  )
}
