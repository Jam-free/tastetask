/**
 * 类型定义
 */

/**
 * 用例等级
 */
export type CaseLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

/**
 * 数据源类型
 */
export type CaseSheet =
  | '对话记忆'
  | '本机·日历'
  | '本机·备忘录'
  | '本机·短信'
  | '本机·联系人'
  | '本机·图库'
  | '本机·文件'
  | '多数据源'
  | '边界负样本'

/**
 * 用例数据
 */
export interface Case {
  id: string
  query: string
  level: CaseLevel
  sheet: CaseSheet
  source: string
  preset: string
  golden: string
  skill: string
  note: string
  imageData: string | null
  userAdded: boolean
  favoriteCount: number
  isFavorited: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 分页信息
 */
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 用例列表响应
 */
export interface CasesResponse {
  cases: Case[]
  pagination: Pagination
}

/**
 * 统计信息
 */
export interface StatsResponse {
  total: number
  byLevel: { level: string; count: number }[]
  bySheet: { sheet: string; count: number }[]
}

/**
 * Tab 类型
 */
export type TabType = 'cards' | 'table' | 'add' | 'favorites'

/**
 * 等级样式配置
 */
export const LEVEL_STYLE: Record<CaseLevel, { bg: string; color: string }> = {
  L1: { bg: '#ECFDF5', color: '#065F46' },
  L2: { bg: '#FFFBEB', color: '#92400E' },
  L3: { bg: '#FFF7ED', color: '#9A3412' },
  L4: { bg: '#FEF2F2', color: '#991B1B' },
  L5: { bg: '#F5F3FF', color: '#4C1D95' },
}

/**
 * 数据源颜色配置
 */
export const SHEET_COLOR: Record<CaseSheet, string> = {
  '对话记忆': '#10B981',
  '本机·日历': '#3B82F6',
  '本机·备忘录': '#F59E0B',
  '本机·短信': '#8B5CF6',
  '本机·联系人': '#EC4899',
  '本机·图库': '#06B6D4',
  '本机·文件': '#78716C',
  '多数据源': '#EF4444',
  '边界负样本': '#6B7280',
}

export const SHEET_OPTIONS: CaseSheet[] = Object.keys(SHEET_COLOR) as CaseSheet[]
