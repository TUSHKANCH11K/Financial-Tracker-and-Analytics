import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabaseClient";
import { useAuthStore } from "./useAuthStore";
import type { Transaction } from "../types/transaction";
import type { Database } from "../types/database";

type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];

const toTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  type: row.type,
  amount: row.amount,
  category: row.category,
  date: row.date,
  comment: row.comment ?? undefined,
});

const toSyncErrorMessage = () => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Нет сети. Изменения сохранены локально и будут доступны офлайн.";
  }

  return "Не удалось синхронизировать изменения с облаком. Локальные данные сохранены.";
};

const getCurrentUserId = () => useAuthStore.getState().user?.id ?? null;

type TransactionStore = {
  transactions: Transaction[];
  syncError: string;
  loadUserTransactions: () => Promise<void>;
  clearSyncError: () => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  importTransactions: (transactions: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
};

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],
      syncError: "",

      clearSyncError: () => set({ syncError: "" }),

      loadUserTransactions: async () => {
        const userId = getCurrentUserId();

        if (!userId) {
          return;
        }

        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false });

        if (error) {
          set({ syncError: toSyncErrorMessage() });
          return;
        }

        set({
          transactions: (data ?? []).map((row) =>
            toTransaction(row as TransactionRow),
          ),
          syncError: "",
        });
      },

      addTransaction: (transaction) =>
        set((state) => {
          const nextTransaction: Transaction = {
            ...transaction,
            id: crypto.randomUUID(),
          };

          const userId = getCurrentUserId();

          if (userId) {
            void supabase
              .from("transactions")
              .insert({
                id: nextTransaction.id,
                user_id: userId,
                type: nextTransaction.type,
                amount: nextTransaction.amount,
                category: nextTransaction.category,
                date: nextTransaction.date,
                comment: nextTransaction.comment ?? null,
              })
              .then(({ error }) => {
                if (error) {
                  set({ syncError: toSyncErrorMessage() });
                }
              });
          }

          return {
            transactions: [...state.transactions, nextTransaction],
          };
        }),

      importTransactions: (transactions) =>
        set((state) => ({
          transactions: [...state.transactions, ...transactions],
        })),

      deleteTransaction: (id) =>
        set((state) => {
          const userId = getCurrentUserId();

          if (userId) {
            void supabase
              .from("transactions")
              .delete()
              .eq("id", id)
              .eq("user_id", userId)
              .then(({ error }) => {
                if (error) {
                  set({ syncError: toSyncErrorMessage() });
                }
              });
          }

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
          };
        }),

      updateTransaction: (id, updates) =>
        set((state) => {
          const userId = getCurrentUserId();

          if (userId) {
            const updatePayload: Database["public"]["Tables"]["transactions"]["Update"] =
              {};

            if (updates.type !== undefined) {
              updatePayload.type = updates.type;
            }

            if (updates.amount !== undefined) {
              updatePayload.amount = updates.amount;
            }

            if (updates.category !== undefined) {
              updatePayload.category = updates.category;
            }

            if (updates.date !== undefined) {
              updatePayload.date = updates.date;
            }

            if (updates.comment !== undefined) {
              updatePayload.comment = updates.comment ?? null;
            }

            void supabase
              .from("transactions")
              .update(updatePayload)
              .eq("id", id)
              .eq("user_id", userId)
              .then(({ error }) => {
                if (error) {
                  set({ syncError: toSyncErrorMessage() });
                }
              });
          }

          return {
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...updates } : t,
            ),
          };
        }),
    }),
    {
      name: "finance-tracker-storage",
    },
  ),
);
