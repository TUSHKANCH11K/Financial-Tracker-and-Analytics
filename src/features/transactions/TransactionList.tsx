import { useTransactionStore } from '../../store/useTransactionStore'
import type { Transaction } from '../../types/transaction'

type TransactionListProps = {
  transactions: Transaction[]
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))

export function TransactionList({ transactions }: TransactionListProps) {
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction)

  if (!transactions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-300 bg-white p-6 text-center text-sm text-surface-600">
        Пока нет операций
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income'

        return (
          <li
            key={transaction.id}
            className="flex flex-col gap-3 rounded-2xl border border-surface-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                    isIncome
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700',
                  ].join(' ')}
                >
                  {isIncome ? 'Доход' : 'Расход'}
                </span>
                <span className="text-sm text-surface-600">{transaction.category}</span>
              </div>

              {transaction.comment ? (
                <p className="text-sm text-surface-600">{transaction.comment}</p>
              ) : null}

              <p className="text-xs text-surface-500">{formatDate(transaction.date)}</p>
            </div>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <p
                className={[
                  'text-lg font-semibold',
                  isIncome ? 'text-emerald-600' : 'text-rose-600',
                ].join(' ')}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount)} ₽
              </p>

              <button
                type="button"
                onClick={() => deleteTransaction(transaction.id)}
                className="rounded-lg border border-surface-300 px-2.5 py-1.5 text-xs font-medium text-surface-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              >
                Удалить
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
