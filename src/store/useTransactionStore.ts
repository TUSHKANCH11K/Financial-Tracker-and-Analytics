import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction } from '../types/transaction'

type TransactionStore = {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: crypto.randomUUID() },
          ],
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        })),
    }),
    {
      name: 'finance-tracker-storage',
    },
  ),
)
