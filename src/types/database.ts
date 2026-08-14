export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          date: string;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "income" | "expense";
          amount: number;
          category: string;
          date: string;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "income" | "expense";
          amount?: number;
          category?: string;
          date?: string;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
