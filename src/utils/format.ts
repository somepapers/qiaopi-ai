export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

export function getSeasonalGreeting(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return '春寒料峭，'
  if (month >= 5 && month <= 7) return '暑气渐盛，'
  if (month >= 8 && month <= 10) return '秋意渐凉，'
  return '天气寒冷，'
}
