import type { Transaction } from '../types/transaction'

export function aggregateByCategory(transactions: Transaction[], month?: string) {
  const filtered = month
    ? transactions.filter(
        (transaction) =>
          transaction.type === 'expense' && transaction.date.startsWith(month),
      )
    : transactions.filter((transaction) => transaction.type === 'expense')

  const totals = filtered.reduce<Record<string, number>>((accumulator, transaction) => {
    accumulator[transaction.category] = (accumulator[transaction.category] ?? 0) + transaction.amount
    return accumulator
  }, {})

  return Object.entries(totals)
    .map(([category, value]) => ({
      name: category,
      value,
    }))
    .sort((left, right) => right.value - left.value)
}

export function aggregateByDay(transactions: Transaction[], month?: string) {
  const monthKey = month ?? new Date().toISOString().slice(0, 7)
  const filtered = transactions.filter((transaction) => transaction.date.startsWith(monthKey))

  const byDay = new Map<string, { income: number; expense: number }>()

  for (const transaction of filtered) {
    const dayKey = transaction.date.slice(0, 10)
    const current = byDay.get(dayKey) ?? { income: 0, expense: 0 }

    if (transaction.type === 'income') {
      current.income += transaction.amount
    } else {
      current.expense += transaction.amount
    }

    byDay.set(dayKey, current)
  }

  return Array.from(byDay.entries())
    .map(([day, totals]) => ({
      day,
      income: totals.income,
      expense: totals.expense,
    }))
    .sort((left, right) => left.day.localeCompare(right.day))
}

export function getBalanceSummary(transactions: Transaction[], month?: string) {
  const monthKey = month ?? new Date().toISOString().slice(0, 7)
  const filtered = transactions.filter((transaction) => transaction.date.startsWith(monthKey))

  const income = filtered
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const expense = filtered
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)

  return {
    income,
    expense,
    balance: income - expense,
  }
}
