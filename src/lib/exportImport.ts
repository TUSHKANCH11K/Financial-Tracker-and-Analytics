import * as XLSX from "xlsx";
import type { Transaction } from "../types/transaction";

const INVALID_IMPORT_ERROR =
  "Невалидный файл импорта. Проверьте формат данных и попробуйте ещё раз.";

const normalizeAmount = (value: unknown): number => {
  const normalized = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  return normalized;
};

const normalizeDate = (value: unknown): string => {
  const dateText =
    typeof value === "string" ? value.trim() : String(value ?? "").trim();

  if (!dateText) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  return date.toISOString();
};

const formatDateForExcel = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}.${month}.${year}`;
};

const normalizeDateFromExcel = (value: unknown): string => {
  const dateText =
    typeof value === "string" ? value.trim() : String(value ?? "").trim();

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateText)) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  const [day, month, year] = dateText.split(".");
  const parsedDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  return parsedDate.toISOString();
};

const normalizeType = (value: unknown, index: number): Transaction["type"] => {
  const typeText =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : String(value ?? "")
          .trim()
          .toLowerCase();

  if (typeText === "income" || typeText === "доход") {
    return "income";
  }

  if (typeText === "expense" || typeText === "расход") {
    return "expense";
  }

  throw new Error(
    `${INVALID_IMPORT_ERROR} Поле "type" в записи №${index + 1} должно быть "income"/"expense" или "Доход"/"Расход".`,
  );
};

const getRowValue = (row: Record<string, unknown>, keys: string[]): unknown => {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [
    key.trim().toLowerCase(),
    value,
  ]);

  for (const key of keys) {
    const normalizedKey = key.trim().toLowerCase();
    const match = normalizedEntries.find(
      ([entryKey]) => entryKey === normalizedKey,
    );

    if (match) {
      return match[1];
    }
  }

  return undefined;
};

const normalizeTransactionRecord = (
  value: unknown,
  index: number,
): Transaction => {
  if (!value || typeof value !== "object") {
    throw new Error(
      `${INVALID_IMPORT_ERROR} Запись №${index + 1} не распознана.`,
    );
  }

  const record = value as Record<string, unknown>;

  const type = normalizeType(record.type, index);

  const id =
    typeof record.id === "string" && record.id.trim()
      ? record.id.trim()
      : `imported-${index + 1}`;
  const category =
    typeof record.category === "string" ? record.category.trim() : "";
  const comment =
    typeof record.comment === "string" && record.comment.trim()
      ? record.comment.trim()
      : undefined;

  if (!category) {
    throw new Error(
      `${INVALID_IMPORT_ERROR} Поле "category" в записи №${index + 1} обязательно.`,
    );
  }

  return {
    id,
    type,
    amount: normalizeAmount(record.amount),
    category,
    date: normalizeDate(record.date),
    ...(comment ? { comment } : {}),
  };
};

const normalizeExcelRecord = (
  row: Record<string, unknown>,
  index: number,
): Transaction => {
  const type = normalizeType(getRowValue(row, ["type", "тип"]), index);
  const amount = normalizeAmount(getRowValue(row, ["amount", "сумма"]));
  const category =
    typeof getRowValue(row, ["category", "категория"]) === "string"
      ? String(getRowValue(row, ["category", "категория"])).trim()
      : "";
  const dateValue = getRowValue(row, ["date", "дата"]);
  const commentValue = getRowValue(row, ["comment", "комментарий"]);

  if (!category) {
    throw new Error(
      `${INVALID_IMPORT_ERROR} Поле "category" в записи №${index + 1} обязательно.`,
    );
  }

  const comment =
    typeof commentValue === "string" && commentValue.trim()
      ? commentValue.trim()
      : undefined;

  return {
    id: crypto.randomUUID(),
    type,
    amount,
    category,
    date: normalizeDateFromExcel(dateValue),
    ...(comment ? { comment } : {}),
  };
};

export async function parseJsonTransactions(
  raw: string,
): Promise<Transaction[]> {
  if (!raw || !raw.trim()) {
    throw new Error(INVALID_IMPORT_ERROR);
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error(INVALID_IMPORT_ERROR);
    }

    return parsed.map((item, index) => normalizeTransactionRecord(item, index));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Невалидный файл импорта")
    ) {
      throw error;
    }

    throw new Error(INVALID_IMPORT_ERROR);
  }
}

export async function importFromJson(file: File): Promise<Transaction[]> {
  const text = await file.text();
  return parseJsonTransactions(text);
}

export async function parseExcelTransactions(
  file: File,
): Promise<Transaction[]> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error(INVALID_IMPORT_ERROR);
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: false,
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(INVALID_IMPORT_ERROR);
    }

    return rows.map((row, index) => normalizeExcelRecord(row, index));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Невалидный файл импорта")
    ) {
      throw error;
    }

    throw new Error(INVALID_IMPORT_ERROR);
  }
}

export async function importFromExcel(file: File): Promise<Transaction[]> {
  return parseExcelTransactions(file);
}

export function exportToJson(transactions: Transaction[]) {
  const payload = JSON.stringify(transactions, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "transactions.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel(transactions: Transaction[]) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(
    transactions.map((transaction, index) => ({
      "№": index + 1,
      Тип: transaction.type === "income" ? "Доход" : "Расход",
      Сумма: transaction.amount,
      Категория: transaction.category,
      Дата: formatDateForExcel(transaction.date),
      Комментарий: transaction.comment ?? "",
    })),
  );

  XLSX.utils.book_append_sheet(workbook, sheet, "Transactions");
  XLSX.writeFile(workbook, "transactions.xlsx");
}
