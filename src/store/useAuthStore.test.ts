import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockUser = {
  id: string
  email: string
}

const authMock = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: authMock,
  },
}))

const { useAuthStore } = await import('./useAuthStore')

const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-1',
  email: 'user@example.com',
  ...overrides,
})

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, isLoading: false })
  })

  it('успешно выполняет signIn и сохраняет пользователя', async () => {
    const user = createMockUser()

    authMock.signInWithPassword.mockResolvedValue({
      data: { user },
      error: null,
    })

    await useAuthStore.getState().signIn('user@example.com', 'secret123')

    expect(authMock.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    })
    expect(useAuthStore.getState().user).toEqual(user)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('возвращает понятную ошибку при неверном пароле', async () => {
    authMock.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: {
        code: 'invalid_credentials',
        message: 'Invalid login credentials',
      },
    })

    await expect(
      useAuthStore.getState().signIn('user@example.com', 'wrong-password'),
    ).rejects.toThrow('Неверный email или пароль')

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('возвращает понятную ошибку при регистрации занятого email', async () => {
    authMock.signUp.mockResolvedValue({
      data: {
        user: {
          ...createMockUser({ email: 'used@example.com' }),
          identities: [],
        },
      },
      error: null,
    })

    await expect(
      useAuthStore.getState().signUp('used@example.com', 'secret123'),
    ).rejects.toThrow('Пользователь с таким email уже зарегистрирован. Попробуйте войти.')

    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('возвращает понятную ошибку при регистрации занятого email из явной ошибки API', async () => {
    authMock.signUp.mockResolvedValue({
      data: { user: null },
      error: {
        code: 'user_already_exists',
        message: 'User already registered',
      },
    })

    await expect(
      useAuthStore.getState().signUp('used@example.com', 'secret123'),
    ).rejects.toThrow('Этот email уже зарегистрирован')

    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('очищает пользователя при signOut', async () => {
    useAuthStore.setState({ user: createMockUser() })

    authMock.signOut.mockResolvedValue({ error: null })

    await useAuthStore.getState().signOut()

    expect(authMock.signOut).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
