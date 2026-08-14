import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Transaction } from "../types/transaction";

const STORAGE_KEY = "finance-tracker-storage";

const authStateMock = vi.hoisted(() => ({
  user: null as null | { id: string },
}));

const selectOrderMock = vi.hoisted(() => vi.fn());
const selectEqMock = vi.hoisted(() =>
  vi.fn(() => ({ order: selectOrderMock })),
);
const selectMock = vi.hoisted(() => vi.fn(() => ({ eq: selectEqMock })));

const insertMock = vi.hoisted(() => vi.fn());

const deleteUserEqMock = vi.hoisted(() => vi.fn());
const deleteIdEqMock = vi.hoisted(() =>
  vi.fn(() => ({ eq: deleteUserEqMock })),
);
const deleteMock = vi.hoisted(() => vi.fn(() => ({ eq: deleteIdEqMock })));

const updateUserEqMock = vi.hoisted(() => vi.fn());
const updateIdEqMock = vi.hoisted(() =>
  vi.fn(() => ({ eq: updateUserEqMock })),
);
const updateMock = vi.hoisted(() => vi.fn(() => ({ eq: updateIdEqMock })));

const fromMock = vi.hoisted(() =>
  vi.fn(() => ({
    select: selectMock,
    insert: insertMock,
    delete: deleteMock,
    update: updateMock,
  })),
);

const localStorageMock = vi.hoisted(() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
});

vi.stubGlobal("localStorage", localStorageMock);

vi.mock("./useAuthStore", () => ({
  useAuthStore: {
    getState: () => authStateMock,
  },
}));

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: fromMock,
  },
}));

const { useTransactionStore } = await import("./useTransactionStore");

const sampleTransaction: Omit<Transaction, "id"> = {
  type: "income",
  amount: 5000,
  category: "Зарплата",
  date: "2026-08-14T00:00:00.000Z",
  comment: "Август",
};

describe("useTransactionStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    authStateMock.user = null;
    useTransactionStore.setState({ transactions: [], syncError: "" });
    useTransactionStore.persist.clearStorage();

    insertMock.mockResolvedValue({ error: null });
    deleteUserEqMock.mockResolvedValue({ error: null });
    updateUserEqMock.mockResolvedValue({ error: null });
    selectOrderMock.mockResolvedValue({ data: [], error: null });
  });

  it("adds a transaction with generated id", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("tx-1");

    useTransactionStore.getState().addTransaction(sampleTransaction);

    expect(useTransactionStore.getState().transactions).toEqual([
      { ...sampleTransaction, id: "tx-1" },
    ]);
  });

  it("deletes a transaction by id", () => {
    useTransactionStore.setState({
      transactions: [
        { ...sampleTransaction, id: "tx-1" },
        {
          id: "tx-2",
          type: "expense",
          amount: 1200,
          category: "Продукты",
          date: "2026-08-13T00:00:00.000Z",
        },
      ],
    });

    useTransactionStore.getState().deleteTransaction("tx-1");

    expect(useTransactionStore.getState().transactions).toEqual([
      {
        id: "tx-2",
        type: "expense",
        amount: 1200,
        category: "Продукты",
        date: "2026-08-13T00:00:00.000Z",
      },
    ]);
  });

  it("updates a transaction by id", () => {
    useTransactionStore.setState({
      transactions: [{ ...sampleTransaction, id: "tx-1" }],
    });

    useTransactionStore.getState().updateTransaction("tx-1", {
      amount: 5500,
      comment: "Премия",
    });

    expect(useTransactionStore.getState().transactions).toEqual([
      {
        ...sampleTransaction,
        id: "tx-1",
        amount: 5500,
        comment: "Премия",
      },
    ]);
  });

  it("persists transactions to localStorage", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("tx-1");

    useTransactionStore.getState().addTransaction(sampleTransaction);

    expect(localStorageMock.setItem).toHaveBeenCalled();

    const stored = JSON.parse(
      localStorageMock.setItem.mock.calls.at(-1)![1] as string,
    );

    expect(stored.state.transactions).toEqual([
      { ...sampleTransaction, id: "tx-1" },
    ]);

    const raw = localStorageMock.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.state.transactions).toHaveLength(1);
  });

  it("syncs transaction insert to supabase for authorized user", async () => {
    authStateMock.user = { id: "user-1" };
    vi.spyOn(crypto, "randomUUID").mockReturnValue("tx-auth-1");

    useTransactionStore.getState().addTransaction(sampleTransaction);
    await Promise.resolve();

    expect(fromMock).toHaveBeenCalledWith("transactions");
    expect(insertMock).toHaveBeenCalledWith({
      id: "tx-auth-1",
      user_id: "user-1",
      type: "income",
      amount: 5000,
      category: "Зарплата",
      date: "2026-08-14T00:00:00.000Z",
      comment: "Август",
    });
  });

  it("keeps local data and exposes sync error when insert fails", async () => {
    authStateMock.user = { id: "user-1" };
    insertMock.mockResolvedValue({ error: { message: "network error" } });
    vi.spyOn(crypto, "randomUUID").mockReturnValue("tx-auth-2");

    useTransactionStore.getState().addTransaction(sampleTransaction);
    await Promise.resolve();

    expect(useTransactionStore.getState().transactions).toHaveLength(1);
    expect(useTransactionStore.getState().syncError).toMatch(
      /Не удалось синхронизировать|Нет сети/i,
    );
  });

  it("loads user transactions from supabase on demand", async () => {
    authStateMock.user = { id: "user-1" };
    selectOrderMock.mockResolvedValue({
      data: [
        {
          id: "tx-remote",
          user_id: "user-1",
          type: "expense",
          amount: 1999,
          category: "Продукты",
          date: "2026-08-15T00:00:00.000Z",
          comment: null,
          created_at: "2026-08-15T12:00:00.000Z",
        },
      ],
      error: null,
    });

    await useTransactionStore.getState().loadUserTransactions();

    expect(selectMock).toHaveBeenCalledWith("*");
    expect(selectEqMock).toHaveBeenCalledWith("user_id", "user-1");
    expect(useTransactionStore.getState().transactions).toEqual([
      {
        id: "tx-remote",
        type: "expense",
        amount: 1999,
        category: "Продукты",
        date: "2026-08-15T00:00:00.000Z",
      },
    ]);
  });

  it("does not lose local transactions when load from supabase fails", async () => {
    authStateMock.user = { id: "user-1" };
    useTransactionStore.setState({
      transactions: [{ ...sampleTransaction, id: "local-1" }],
      syncError: "",
    });
    selectOrderMock.mockResolvedValue({
      data: null,
      error: { message: "fetch failed" },
    });

    await useTransactionStore.getState().loadUserTransactions();

    expect(useTransactionStore.getState().transactions).toEqual([
      { ...sampleTransaction, id: "local-1" },
    ]);
    expect(useTransactionStore.getState().syncError).toMatch(
      /Не удалось синхронизировать|Нет сети/i,
    );
  });
});
