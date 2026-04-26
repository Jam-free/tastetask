import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// 中间件
import { extractUserId, validateUserId } from './middleware/auth.js'

// 路由
import { getCases, getStats } from './routes/cases.js'
import { getCaseById, deleteCase } from './routes/casesById.js'
import { addFavorite, removeFavorite, getFavorites } from './routes/favorites.js'
import { createCase } from './routes/createCase.js'
import { uploadSingle, uploadImage, handleUploadError } from './routes/upload.js'
import { login, verifyAdmin, verifyToken, logout } from './routes/auth.js'
import {
  getAdminStats,
  getAllCases,
  adminDeleteCase,
  restoreCase,
  getAllFavorites,
} from './routes/admin.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))

// JSON 解析
app.use(express.json({ limit: '1mb' }))

// 提取用户ID中间件（所有请求）
app.use(extractUserId)

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 每个IP限制100个请求
  message: '请求过于频繁，请稍后再试',
})
app.use('/api', limiter)

// ==================== 健康检查 ====================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  })
})

// ==================== 统计信息 ====================
app.get('/api/cases/stats', getStats)

// ==================== 用例 ====================
// 获取用例列表
app.get('/api/cases', getCases)

// 创建用例（需要用户ID）
app.post('/api/cases', validateUserId, createCase)

// 获取单个用例详情
app.get('/api/cases/:id', getCaseById)

// 删除用例（需要用户ID，仅限用户添加的用例）
app.delete('/api/cases/:id', validateUserId, deleteCase)

// ==================== 收藏 ====================
// 收藏用例
app.post('/api/cases/:id/favorite', validateUserId, addFavorite)

// 取消收藏
app.delete('/api/cases/:id/favorite', validateUserId, removeFavorite)

// 获取用户收藏列表
app.get('/api/favorites', validateUserId, getFavorites)

// ==================== 上传 ====================
// 上传图片
app.post('/api/upload', validateUserId, uploadSingle, uploadImage)
app.use(handleUploadError)

// ==================== 管理员认证 ====================
// 管理员登录
app.post('/api/auth/login', login)

// 验证令牌
app.get('/api/auth/verify', verifyAdmin, verifyToken)

// 登出
app.post('/api/auth/logout', logout)

// ==================== 管理员接口 ====================
// 管理员统计数据
app.get('/api/admin/stats', verifyAdmin, getAdminStats)

// 获取所有用例（管理员）
app.get('/api/admin/cases', verifyAdmin, getAllCases)

// 删除用例（管理员，可删除预置用例）
app.delete('/api/admin/cases/:id', verifyAdmin, adminDeleteCase)

// 恢复已删除的用例
app.post('/api/admin/cases/:id/restore', verifyAdmin, restoreCase)

// 获取所有收藏记录
app.get('/api/admin/favorites', verifyAdmin, getAllFavorites)

// ==================== 错误处理 ====================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
  })
})

app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

// ==================== 启动服务器 ====================
app.listen(PORT, () => {
  console.log(`🚀 Taste-Task 后端服务器运行在 http://localhost:${PORT}`)
  console.log(`📚 健康检查: http://localhost:${PORT}/api/health`)
  console.log(`📊 API 接口:`)
  console.log(`   GET    /api/cases           - 获取用例列表`)
  console.log(`   GET    /api/cases/stats     - 获取统计信息`)
  console.log(`   GET    /api/cases/:id       - 获取用例详情`)
  console.log(`   POST   /api/cases           - 创建用例`)
  console.log(`   DELETE /api/cases/:id       - 删除用例`)
  console.log(`   POST   /api/cases/:id/favorite - 收藏用例`)
  console.log(`   DELETE /api/cases/:id/favorite - 取消收藏`)
  console.log(`   GET    /api/favorites       - 获取收藏列表`)
  console.log(`   POST   /api/upload          - 上传图片`)
  console.log(`   POST   /api/auth/login      - 管理员登录`)
  console.log(`   GET    /api/auth/verify     - 验证令牌`)
})
