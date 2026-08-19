import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [error, setError] = useState('')

  const handleSignOut = async () => {
    setError('')

    try {
      await signOut()
    } catch {
      setError('Не удалось выйти. Попробуйте ещё раз.')
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-surface-200 bg-white px-4 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight text-primary-800 md:text-xl">
        Финансовый трекер
      </h1>

      {user ? (
        <div className="flex items-center gap-3">
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoading}
            className="rounded-lg border border-surface-300 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 transition hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Выйти
          </button>
        </div>
      ) : null}
    </header>
  )
}
