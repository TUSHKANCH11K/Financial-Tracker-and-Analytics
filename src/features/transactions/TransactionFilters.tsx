import { useEffect, useMemo, useState } from 'react'
import type { Transaction } from '../../types/transaction'

export type TransactionFilterState = {
  type: 'all' | 'income' | 'expense'
  category: 'all' | string
  month: 'all' | string
}

type TransactionFiltersProps = {
  transactions: Transaction[]
  onChange: (filters: TransactionFilterState) => void
}

const defaultFilters: TransactionFilterState = {
  type: 'all',
  category: 'all',
  month: 'all',
}

const categories = ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Зарплата', 'Другое']

export function TransactionFilters({ transactions, onChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilterState>(defaultFilters)

  const availableCategories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map((transaction) => transaction.category))]
    return categories.filter((category) => uniqueCategories.includes(category))
  }, [transactions])

  const months = useMemo(
    () =>
      [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))].sort((a, b) =>
        b.localeCompare(a),
      ),
    [transactions],
  )

  useEffect(() => {
    onChange(filters)
  }, [filters, onChange])

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-surface-800">Фильтры</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-2 text-sm text-surface-700">
          <span>Тип</span>
          <select
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({ ...current, type: event.target.value as TransactionFilterState['type'] }))
            }
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">Все</option>
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-surface-700">
          <span>Категория</span>
          <select
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({ ...current, category: event.target.value as TransactionFilterState['category'] }))
            }
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">Все</option>
            {(availableCategories.length ? availableCategories : categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-surface-700">
          <span>Месяц</span>
          <select
            value={filters.month}
            onChange={(event) =>
              setFilters((current) => ({ ...current, month: event.target.value as TransactionFilterState['month'] }))
            }
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="all">Все</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {new Intl.DateTimeFormat('ru-RU', {
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(`${month}-01T00:00:00`))}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
