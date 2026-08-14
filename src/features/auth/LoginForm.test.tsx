import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

const signInMock = vi.fn()
const signUpMock = vi.fn()

const storeState = {
  user: null,
  isLoading: false,
  signIn: signInMock,
  signUp: signUpMock,
  signOut: vi.fn(),
}

vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    storeState.isLoading = false
  })

  it('показывает ошибку входа при неверном пароле', async () => {
    signInMock.mockRejectedValue(new Error('Неверный email или пароль'))

    render(<LoginForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'wrongpass' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль')
  })

  it('показывает ошибку при повторной регистрации существующего email', async () => {
    signUpMock.mockRejectedValue(
      new Error('Пользователь с таким email уже зарегистрирован. Попробуйте войти.'),
    )

    render(<LoginForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Регистрация' }))

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'used@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/пароль/i), {
      target: { value: 'secret123' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Пользователь с таким email уже зарегистрирован. Попробуйте войти.',
    )
  })
})
