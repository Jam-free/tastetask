import { Request, Response } from 'express'

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

/**
 * 用例过滤参数接口
 */
export interface CaseFilterParams {
  level?: string
  sheet?: string
  userId?: string
  random?: boolean
  limit?: number
}

/**
 * 解析分页参数
 */
export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 30))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * 解析用例过滤参数
 */
export function parseCaseFilter(req: Request): CaseFilterParams {
  const level = req.query.level as string | undefined
  const sheet = req.query.sheet as string | undefined
  const random = req.query.random === 'true'
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

  return { level, sheet, random, limit }
}

/**
 * 成功响应
 */
export function success<T>(res: Response, data: T, message?: string): void {
  res.json({
    success: true,
    data,
    ...(message && { message }),
  })
}

/**
 * 错误响应
 */
export function error(res: Response, message: string, statusCode = 400): void {
  res.status(statusCode).json({
    success: false,
    error: message,
  })
}
