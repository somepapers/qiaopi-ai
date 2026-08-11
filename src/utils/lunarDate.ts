/**
 * 公历→农历 转换工具
 * 基于 lunar-ts 库（零依赖，~3KB）
 */

import { lunar } from 'lunar-ts'

const MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

const DAY_NAMES = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]

/**
 * 返回落款用的农历日期字符串，如"丙午年六月二十九"
 */
export function getLunarDateString(date?: Date): string {
  const d = lunar(date ?? new Date())
  const gzYear = d.ganzhi?.year ?? ''
  const monthName = MONTH_NAMES[(d.month ?? 1) - 1]
  const dayName = DAY_NAMES[(d.day ?? 1) - 1]
  return `${gzYear}年${d.isLeap ? '闰' : ''}${monthName}月${dayName}`
}
