import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#2f7059', '#3d8b6e', '#8ec4ad', '#d4bf91', '#b54a4a', '#495057']

type CategoryPieChartProps = {
  data: Array<{
    name: string
    value: number
  }>
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-4 text-sm text-surface-600">
        Нет расходов за выбранный месяц
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-surface-900">Расходы по категориям</h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={82} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} ₽`, 'Сумма']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2">
          {data.map((entry, index) => (
            <li key={entry.name} className="flex items-center justify-between gap-2 text-sm text-surface-700">
              <span className="flex items-center gap-2 truncate">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="font-medium">{entry.value} ₽</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
