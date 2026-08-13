import { useState } from 'react'
import { useTransactionStore } from '../../store/useTransactionStore'
import type { Transaction } from '../../types/transaction'

const transactionCategories = [
  'Еда',
  'Транспорт',
  'Жильё',
  'Развлечения',
  'Зарплата',
  'Другое',
] as const

type TransactionType = Transaction['type']

type TransactionFormState = {
  type: TransactionType
  amount: string
  category: string
  date: string
  comment: string
}

const getTodayDate = () => new Date().toISOString().slice(0, 10)

const getInitialFormState = (): TransactionFormState => ({
  type: 'income',
  amount: '',
  category: 'Зарплата',
  date: getTodayDate(),
  comment: '',
})

export function TransactionForm() {
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const [form, setForm] = useState<TransactionFormState>(getInitialFormState)
  const [error, setError] = useState('')

  const updateField = <Field extends keyof TransactionFormState>(
    field: Field,
    value: TransactionFormState[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (error) {
      setError('')
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Введите сумму больше 0')
      return
    }

    if (!form.category || !transactionCategories.includes(form.category as (typeof transactionCategories)[number])) {
      setError('Выберите категорию')
      return
    }

    addTransaction({
      type: form.type,
      amount,
      category: form.category,
      date: form.date || getTodayDate(),
      comment: form.comment.trim() || undefined,
    })

    setForm(getInitialFormState())
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-surface-700">Тип</p>
        <div className="grid grid-cols-2 gap-2">
          {(['income', 'expense'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateField('type', type)}
              className={[
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                form.type === type
                  ? type === 'income'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-surface-200 bg-white text-surface-700 hover:bg-surface-50',
              ].join(' ')}
            >
              {type === 'income' ? 'Доход' : 'Расход'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-surface-700">
          Сумма
        </label>
        <input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) => updateField('amount', event.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium text-surface-700">
          Категория
        </label>
        <select
          id="category"
          value={form.category}
          onChange={(event) => updateField('category', event.target.value)}
          className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">Выберите категорию</option>
          {transactionCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium text-surface-700">
          Дата
        </label>
        <input
          id="date"
          type="date"
          value={form.date}
          onChange={(event) => updateField('date', event.target.value)}
          className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-medium text-surface-700">
          Комментарий
        </label>
        <textarea
          id="comment"
          value={form.comment}
          onChange={(event) => updateField('comment', event.target.value)}
          rows={3}
          placeholder="Добавьте заметку"
          className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3 py-2.5 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
      >
        Добавить
      </button>
    </form>
  )
}
