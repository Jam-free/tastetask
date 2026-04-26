import multer from 'multer'
import path from 'path'
import { Request, Response } from 'express'
import { success, error } from '../lib/api-utils.js'

/**
 * 配置文件上传
 * 限制文件大小为 5MB
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    // 只允许图片
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      cb(null, true)
    } else {
      cb(new Error('只支持上传图片文件'))
    }
  },
})

/**
 * 单文件上传中间件
 */
export const uploadSingle = upload.single('file')

/**
 * POST /api/upload
 * 上传图片，返回 base64 编码
 */
export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId

    if (!userId) {
      return error(res, '需要登录', 401)
    }

    const file = req.file

    if (!file) {
      return error(res, '没有上传文件')
    }

    // 将图片转换为 base64
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

    return success(res, {
      data: base64,
      size: file.size,
      mimetype: file.mimetype,
    }, '上传成功')
  } catch (err) {
    console.error('上传失败:', err)
    return error(res, '上传失败', 500)
  }
}

/**
 * 处理上传错误的中间件
 */
export function handleUploadError(
  err: Error,
  _req: Request,
  res: Response,
  next: Function
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return error(res, '文件大小不能超过 5MB', 400)
    }
    return error(res, `上传错误: ${err.message}`, 400)
  }
  if (err.message === '只支持上传图片文件') {
    return error(res, err.message, 400)
  }
  next(err)
}
