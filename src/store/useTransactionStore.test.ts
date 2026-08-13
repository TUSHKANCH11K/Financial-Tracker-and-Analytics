import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Transaction } from '../types/transaction'

const STORAGE_KEY = 'finance-tracker-storage'

const localStorageMock = vi.hoisted(() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})

vi.stubGlobal('localStorage', localStorageMock)

const { useTransactionStore } = await import('./useTransactionStore')

const sampleTransaction: Omit<Transaction, 'id'> = {
  type: 'income',
  amount: 5000,
  category: 'Зарплата',
  date: '2026-08-14T00:00:00.000Z',
  comment: 'Август',
}

describe('useTransactionStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    useTransactionStore.setState({ transactions: [] })
    useTransactionStore.persist.clearStorage()
  })

  it('adds a transaction with generated id', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('tx-1')

    useTransactionStore.getState().addTransaction(sampleTransaction)

    expect(useTransactionStore.getState().transactions).toEqual([
      { ...sampleTransaction, id: 'tx-1' },
    ])
  })

  it('deletes a transaction by id', () => {
    useTransactionStore.setState({
      transactions: [
        { ...sampleTransaction, id: 'tx-1' },
        {
          id: 'tx-2',
          type: 'expense',
          amount: 1200,
          category: 'Продукты',
          date: '2026-08-13T00:00:00.000Z',
        },
      ],
    })

    useTransactionStore.getState().deleteTransaction('tx-1')

    expect(useTransactionStore.getState().transactions).toEqual([
      {
        id: 'tx-2',
        type: 'expense',
        amount: 1200,
        category: 'Продукты',
        date: '2026-08-13T00:00:00.000Z',
      },
    ])
  })

  it('updates a transaction by id', () => {
    useTransactionStore.setState({
      transactions: [{ ...sampleTransaction, id: 'tx-1' }],
    })

    useTransactionStore.getState().updateTransaction('tx-1', {
      amount: 5500,
      comment: 'Премия',
    })

    expect(useTransactionStore.getState().transactions).toEqual([
      {
        ...sampleTransaction,
        id: 'tx-1',
        amount: 5500,
        comment: 'Премия',
      },
    ])
  })

  it('persists transactions to localStorage', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('tx-1')

    useTransactionStore.getState().addTransaction(sampleTransaction)

    expect(localStorageMock.setItem).toHaveBeenCalled()

    const stored = JSON.parse(
      localStorageMock.setItem.mock.calls.at(-1)![1] as string,
    )

    expect(stored.state.transactions).toEqual([
      { ...sampleTransaction, id: 'tx-1' },
    ])

    const raw = localStorageMock.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()

    const parsed = JSON.parse(raw!)
    expect(parsed.state.transactions).toHaveLength(1)
  })
})
