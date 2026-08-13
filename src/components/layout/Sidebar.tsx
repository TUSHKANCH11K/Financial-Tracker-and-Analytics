const navItems = ['Операции', 'Аналитика', 'Настройки'] as const

export function Sidebar() {
  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-surface-200 bg-white md:block">
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-surface-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <nav className="flex gap-1 overflow-x-auto border-b border-surface-200 bg-white px-2 py-2 md:hidden">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
          >
            {item}
          </button>
        ))}
      </nav>
    </>
  )
}
