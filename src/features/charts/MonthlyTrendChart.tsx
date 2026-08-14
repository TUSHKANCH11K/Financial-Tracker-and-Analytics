import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type MonthlyTrendChartProps = {
  data: Array<{
    day: string
    income: number
    expense: number
  }>
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-surface-50 p-4 text-sm text-surface-600">
        Нет данных за выбранный месяц
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-surface-900">Динамика доходов и расходов</h3>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: number) => [`${value} ₽`, 'Сумма']} />
            <Legend />
            <Bar dataKey="expense" fill="#b54a4a" radius={[4, 4, 0, 0]} name="Расход" />
            <Line type="monotone" dataKey="income" stroke="#2f7059" strokeWidth={3} dot={{ r: 3 }} name="Доход" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
