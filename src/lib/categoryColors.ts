export const categoryColors: Record<string, string> = {
  Еда: '#D97706',
  Транспорт: '#2563EB',
  Жильё: '#7C3AED',
  Развлечения: '#DB2777',
  Зарплата: '#16A34A',
  Другое: '#6B7280',
}

export const fallbackCategoryColors = [
  '#0D9488',
  '#CA8A04',
  '#DC2626',
  '#4F46E5',
  '#059669',
  '#B45309',
]

export function getCategoryColor(category: string, index = 0) {
  if (categoryColors[category]) {
    return categoryColors[category]
  }

  return fallbackCategoryColors[index % fallbackCategoryColors.length]
}
