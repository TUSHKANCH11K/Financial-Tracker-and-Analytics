import { describe, expect, it } from "vitest";
import { aggregateByCategory, aggregateByDay } from "./aggregations";
import type { Transaction } from "../types/transaction";

describe("aggregations", () => {
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      amount: 250,
      category: "Еда",
      date: "2026-08-03",
      comment: "Обед",
    },
    {
      id: "2",
      type: "expense",
      amount: 120,
      category: "Транспорт",
      date: "2026-08-05",
      comment: "Такси",
    },
    {
      id: "3",
      type: "income",
      amount: 2000,
      category: "Зарплата",
      date: "2026-08-10",
    },
    {
      id: "4",
      type: "expense",
      amount: 80,
      category: "Еда",
      date: "2026-08-10",
    },
    {
      id: "5",
      type: "expense",
      amount: 400,
      category: "Жильё",
      date: "2026-07-20",
    },
  ];

  it("aggregateByCategory суммирует расходы по категориям за указанный месяц", () => {
    expect(aggregateByCategory(transactions, "2026-08")).toEqual([
      { name: "Еда", value: 330 },
      { name: "Транспорт", value: 120 },
    ]);
  });

  it("aggregateByCategory возвращает пустой массив, если за месяц нет расходов", () => {
    expect(aggregateByCategory(transactions, "2026-09")).toEqual([]);
  });

  it("aggregateByDay группирует доходы и расходы по дням месяца", () => {
    expect(aggregateByDay(transactions, "2026-08")).toEqual([
      { day: "2026-08-03", income: 0, expense: 250 },
      { day: "2026-08-05", income: 0, expense: 120 },
      { day: "2026-08-10", income: 2000, expense: 80 },
    ]);
  });
});
