import { useMemo } from 'react'
import { getBalanceSummary } from '../../lib/aggregations'
import type { Transaction } from '../../types/transaction'

type BalanceSummaryProps = {
  transactions: Transaction[]
  month?: string
}

export function BalanceSummary({ transactions, month }: BalanceSummaryProps) {
  const summary = useMemo(() => getBalanceSummary(transactions, month), [month, transactions])

  const cards = [
    {
      title: 'Доходы',
      value: summary.income,
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Расходы',
      value: summary.expense,
      accent: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      title: 'Баланс',
      value: summary.balance,
      accent: summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bg: summary.balance >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm"
        >
          <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${card.bg} ${card.accent}`}>
            {card.title}
          </div>

          <p className={`mt-4 text-2xl font-semibold ${card.accent}`}>
            {card.value.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      ))}
    </div>
  )
}
