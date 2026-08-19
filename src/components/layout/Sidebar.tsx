const navItems = [
  { label: 'Операции', value: 'transactions' },
  { label: 'Аналитика', value: 'analytics' },
] as const

type SidebarProps = {
  activeTab: 'transactions' | 'analytics'
  onTabChange: (tab: 'transactions' | 'analytics') => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-surface-200 bg-white md:block">
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onTabChange(item.value)}
              className={[
                'rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors',
                activeTab === item.value
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-700 hover:bg-primary-50 hover:text-primary-700',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <nav className="flex gap-1 overflow-x-auto border-b border-surface-200 bg-white px-2 py-2 md:hidden">
        {navItems.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onTabChange(item.value)}
            className={[
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              activeTab === item.value
                ? 'bg-primary-50 text-primary-700'
                : 'text-surface-700 hover:bg-primary-50 hover:text-primary-700',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </>
  )
}
