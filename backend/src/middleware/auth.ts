import { Request, Response, NextFunction } from 'express'

/**
 * 扩展 Express Request 类型，添加 userId 和 isAdmin
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string
      isAdmin?: boolean
    }
  }
}

/**
 * 从请求头获取用户ID
 * 前端通过 X-User-Id header 传递
 */
export function extractUserId(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string | undefined

  if (userId) {
    req.userId = userId
  }

  next()
}

/**
 * 简单的用户ID验证
 * 确保userId是有效的UUID格式
 */
export function validateUserId(req: Request, res: Response, next: NextFunction): void {
  const userId = req.headers['x-user-id'] as string | undefined

  if (!userId) {
    res.status(401).json({ error: '缺少用户ID，请提供 X-User-Id header' })
    return
  }

  // 简单的UUID格式验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    res.status(400).json({ error: '无效的用户ID格式' })
    return
  }

  req.userId = userId
  next()
}
