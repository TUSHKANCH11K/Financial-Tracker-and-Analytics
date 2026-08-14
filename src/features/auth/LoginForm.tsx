import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'

type AuthMode = 'signin' | 'signup'

const isValidEmail = (value: string) => /.+@.+\..+/.test(value)

export function LoginForm() {
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setError('')
    setSuccess('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      setError('Введите корректный email')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    try {
      if (mode === 'signin') {
        await signIn(normalizedEmail, password)
        return
      }

      await signUp(normalizedEmail, password)
      setSuccess('Регистрация успешна. Если вход не выполнен автоматически, подтвердите email.')
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось выполнить запрос. Попробуйте ещё раз.'
      setError(message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-surface-900">Финансовый трекер</h2>
        <p className="mt-1 text-sm text-surface-600">Войдите или создайте аккаунт</p>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-lg border border-surface-200 bg-surface-50 p-1">
        <button
          type="button"
          onClick={() => handleModeChange('signin')}
          className={[
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'signin' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-600',
          ].join(' ')}
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('signup')}
          className={[
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-surface-600',
          ].join(' ')}
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-surface-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (error) setError('')
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-surface-700">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError('')
            }}
            placeholder="Минимум 6 символов"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-surface-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </label>

        {error ? (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {!error && success ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-primary-400"
        >
          {isLoading
            ? 'Подождите...'
            : mode === 'signin'
              ? 'Войти'
              : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}
