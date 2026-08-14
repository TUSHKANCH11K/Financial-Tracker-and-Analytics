import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

type AuthStore = {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const toAuthErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const code =
    'code' in error && typeof error.code === 'string' ? error.code.toLowerCase() : ''

  const message =
    'message' in error && typeof error.message === 'string'
      ? error.message.toLowerCase()
      : ''

  if (code.includes('invalid_credentials') || message.includes('invalid login credentials')) {
    return 'Неверный email или пароль'
  }

  if (
    code.includes('user_already_exists') ||
    code.includes('email_exists') ||
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('email address is already')
  ) {
    return 'Этот email уже зарегистрирован'
  }

  if (message.includes('password should be at least')) {
    return 'Пароль должен содержать минимум 6 символов'
  }

  return fallback
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  signUp: async (email, password) => {
    set({ isLoading: true })

    try {
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        throw new Error(
          toAuthErrorMessage(error, 'Не удалось зарегистрироваться. Попробуйте другой email.'),
        )
      }

      if (data.user?.identities && data.user.identities.length === 0) {
        throw new Error('Пользователь с таким email уже зарегистрирован. Попробуйте войти.')
      }

      set({ user: data.user ?? null })
    } finally {
      set({ isLoading: false })
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        throw new Error(toAuthErrorMessage(error, 'Не удалось войти. Попробуйте ещё раз.'))
      }

      set({ user: data.user })
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    set({ isLoading: true })

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw new Error('Не удалось выйти из аккаунта. Попробуйте ещё раз.')
      }

      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))
