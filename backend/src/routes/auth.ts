import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { success, error } from '../lib/api-utils.js'

/**
 * 管理员密码哈希（从 .env 读取）
 */
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'

/**
 * 登录请求体接口
 */
interface LoginBody {
  password: string
}

/**
 * POST /api/auth/login
 * 管理员登录
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body: LoginBody = req.body

    if (!body.password) {
      return error(res, '请输入密码', 400)
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(body.password, ADMIN_PASSWORD_HASH)

    if (!isPasswordValid) {
      return error(res, '密码错误', 401)
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        isAdmin: true,
        timestamp: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    return success(res, {
      token,
      expiresIn: JWT_EXPIRES_IN,
    }, '登录成功')
  } catch (err) {
    console.error('登录失败:', err)
    return error(res, '登录失败', 500)
  }
}

/**
 * JWT 验证中间件
 */
export function verifyAdmin(req: Request, res: Response, next: Function): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, '未提供认证令牌', 401)
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      isAdmin: boolean
      timestamp: number
    }

    if (!decoded.isAdmin) {
      return error(res, '无效的令牌', 403)
    }

    req.isAdmin = true
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return error(res, '令牌已过期', 401)
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return error(res, '无效的令牌', 401)
    }
    return error(res, '认证失败', 500)
  }
}

/**
 * GET /api/auth/verify
 * 验证管理员令牌
 */
export async function verifyToken(req: Request, res: Response): Promise<void> {
  return success(res, {
    isAdmin: true,
    timestamp: Date.now(),
  })
}

/**
 * POST /api/auth/logout
 * 登出（客户端删除 token 即可，服务端返回成功）
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  return success(res, null, '登出成功')
}
