import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TransactionForm } from './TransactionForm'
import { useTransactionStore } from '../../store/useTransactionStore'

describe('TransactionForm', () => {
  beforeEach(() => {
    useTransactionStore.setState({
      transactions: [],
    })
    vi.restoreAllMocks()
  })

  it('не сабмитится с пустой суммой', () => {
    const addTransactionSpy = vi.spyOn(useTransactionStore.getState(), 'addTransaction')

    render(<TransactionForm />)

    fireEvent.change(screen.getByLabelText(/сумма/i), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    expect(addTransactionSpy).not.toHaveBeenCalled()
    expect(screen.getByText(/введите сумму больше 0/i)).toBeInTheDocument()
  })

  it('при валидном сабмите вызывается addTransaction с правильными данными', () => {
    const addTransactionSpy = vi.spyOn(useTransactionStore.getState(), 'addTransaction')

    render(<TransactionForm />)

    fireEvent.change(screen.getByLabelText(/сумма/i), {
      target: { value: '1500' },
    })
    fireEvent.change(screen.getByLabelText(/категория/i), {
      target: { value: 'Зарплата' },
    })
    fireEvent.change(screen.getByLabelText(/дата/i), {
      target: { value: '2026-08-14' },
    })
    fireEvent.change(screen.getByLabelText(/комментарий/i), {
      target: { value: 'Премия' },
    })

    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))

    expect(addTransactionSpy).toHaveBeenCalledTimes(1)
    expect(addTransactionSpy).toHaveBeenCalledWith({
      type: 'income',
      amount: 1500,
      category: 'Зарплата',
      date: '2026-08-14',
      comment: 'Премия',
    })
    expect(screen.getByLabelText(/сумма/i)).toHaveValue(null)
  })
})
