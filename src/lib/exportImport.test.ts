import { afterEach, describe, expect, it, vi } from 'vitest'
import * as XLSX from 'xlsx'
import {
  exportToExcel,
  importFromExcel,
  importFromJson,
  parseExcelTransactions,
  parseJsonTransactions,
} from './exportImport'

const validTransactions = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 2500,
    category: 'Зарплата',
    date: '2026-08-01T00:00:00.000Z',
    comment: 'Основной доход',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 350,
    category: 'Еда',
    date: '2026-08-05T00:00:00.000Z',
  },
] as const

describe('exportImport helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses a valid JSON array of transactions', async () => {
    await expect(parseJsonTransactions(JSON.stringify(validTransactions))).resolves.toEqual(
      validTransactions,
    )
  })

  it('rejects invalid JSON structure with a clear error', async () => {
    await expect(parseJsonTransactions(JSON.stringify({ ok: true }))).rejects.toThrow(
      'Невалидный файл импорта',
    )

    await expect(parseJsonTransactions('[]')).rejects.toThrow('Невалидный файл импорта')
  })

  it('exports Excel rows without id and with readable columns', () => {
    const writeFileSpy = vi.spyOn(XLSX, 'writeFile').mockImplementation(() => undefined)

    exportToExcel([...validTransactions])

    expect(writeFileSpy).toHaveBeenCalledTimes(1)

    const workbook = writeFileSpy.mock.calls[0]?.[0]
    const sheet = workbook.Sheets.Transactions
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })

    expect(rows[0]).toMatchObject({
      '№': 1,
      'Тип': 'Доход',
      'Сумма': 2500,
      'Категория': 'Зарплата',
      'Дата': '01.08.2026',
      'Комментарий': 'Основной доход',
    })
    expect(Object.keys(rows[0])).not.toContain('id')
  })

  it('imports a valid Excel file and generates new ids', async () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('generated-1')
      .mockReturnValueOnce('generated-2')

    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.json_to_sheet([
      {
        '№': 1,
        'Тип': 'Доход',
        'Сумма': 2500,
        'Категория': 'Зарплата',
        'Дата': '01.08.2026',
        'Комментарий': 'Основной доход',
      },
      {
        '№': 2,
        'Тип': 'Расход',
        'Сумма': 350,
        'Категория': 'Еда',
        'Дата': '05.08.2026',
        'Комментарий': '',
      },
    ])

    XLSX.utils.book_append_sheet(workbook, sheet, 'Transactions')

    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const file = new File([buffer], 'transactions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await expect(importFromExcel(file)).resolves.toEqual([
      {
        id: 'generated-1',
        type: 'income',
        amount: 2500,
        category: 'Зарплата',
        date: '2026-08-01T00:00:00.000Z',
        comment: 'Основной доход',
      },
      {
        id: 'generated-2',
        type: 'expense',
        amount: 350,
        category: 'Еда',
        date: '2026-08-05T00:00:00.000Z',
      },
    ])
  })

  it('rejects invalid Excel rows with a clear error', async () => {
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.json_to_sheet([
      {
        '№': 1,
        'Тип': 'Доход',
        'Сумма': 100,
        'Категория': 'Зарплата',
        'Дата': '01.08.2026',
        'Комментарий': 'OK',
      },
      {
        '№': 2,
        'Тип': 'Неизвестно',
        'Сумма': 100,
        'Категория': 'Тест',
        'Дата': '02.08.2026',
        'Комментарий': 'BAD',
      },
    ])

    XLSX.utils.book_append_sheet(workbook, sheet, 'Transactions')
    const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
    const file = new File([buffer], 'bad.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await expect(parseExcelTransactions(file)).rejects.toThrow('Невалидный файл импорта')
    await expect(importFromExcel(file)).rejects.toThrow('Невалидный файл импорта')
  })

  it('imports JSON file with valid structure', async () => {
    const file = new File([JSON.stringify(validTransactions)], 'transactions.json', {
      type: 'application/json',
    })

    await expect(importFromJson(file)).resolves.toEqual(validTransactions)
  })
})
