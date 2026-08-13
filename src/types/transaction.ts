export type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  date: string
  comment?: string
}
