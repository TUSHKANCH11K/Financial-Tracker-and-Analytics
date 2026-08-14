import { useRef, useState } from 'react'
import {
  exportToExcel,
  exportToJson,
  importFromExcel,
  importFromJson,
} from '../../lib/exportImport'
import { useTransactionStore } from '../../store/useTransactionStore'

export function ImportExportPanel() {
  const transactions = useTransactionStore((state) => state.transactions)
  const importTransactions = useTransactionStore((state) => state.importTransactions)
  const jsonInputRef = useRef<HTMLInputElement | null>(null)
  const excelInputRef = useRef<HTMLInputElement | null>(null)
  const [status, setStatus] = useState('')

  const handleImport = async (file: File | null, format: 'json' | 'excel') => {
    if (!file) {
      return
    }

    try {
      const imported =
        format === 'json' ? await importFromJson(file) : await importFromExcel(file)

      importTransactions(imported)
      setStatus(`Импортировано ${imported.length} операций.`)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось импортировать данные. Проверьте файл и попробуйте ещё раз.'

      setStatus(message)
    } finally {
      const input = format === 'json' ? jsonInputRef.current : excelInputRef.current
      if (input) {
        input.value = ''
      }
    }
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportToJson(transactions)}
          className="rounded-lg bg-primary-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-primary-800"
        >
          Экспорт JSON
        </button>
        <button
          type="button"
          onClick={() => jsonInputRef.current?.click()}
          className="rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50"
        >
          Импорт JSON
        </button>
        <button
          type="button"
          onClick={() => exportToExcel(transactions)}
          className="rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50"
        >
          Экспорт Excel
        </button>
        <button
          type="button"
          onClick={() => excelInputRef.current?.click()}
          className="rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50"
        >
          Импорт Excel
        </button>
      </div>

      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          void handleImport(file, 'json')
        }}
      />

      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null
          void handleImport(file, 'excel')
        }}
      />

      {status ? (
        <p className="mt-3 text-sm text-surface-700" role="alert">
          {status}
        </p>
      ) : null}
    </div>
  )
}
