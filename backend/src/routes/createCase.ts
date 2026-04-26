import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { success, error } from '../lib/api-utils.js'
import { sanitizeText, validateLevel, sanitizeImageData } from '../lib/validation.js'

/**
 * 创建用例的请求体接口
 */
interface CreateCaseBody {
  query: string
  level: string
  sheet: string
  source: string
  preset?: string
  golden: string
  skill?: string
  note?: string
  imageData?: string
}

/**
 * POST /api/cases
 * 用户添加自定义用例
 */
export async function createCase(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId

    if (!userId) {
      return error(res, '需要登录', 401)
    }

    const body: CreateCaseBody = req.body

    // 验证并清理输入
    const queryValidation = sanitizeText(body.query || '', {
      maxLength: 500,
      allowEmpty: false,
    })
    if (!queryValidation.valid) {
      return error(res, 'query 字段无效或过长（最大500字符）')
    }

    const goldenValidation = sanitizeText(body.golden || '', {
      maxLength: 5000,
      allowEmpty: false,
    })
    if (!goldenValidation.valid) {
      return error(res, 'golden 字段无效或过长（最大5000字符）')
    }

    const levelValidation = validateLevel(body.level)
    if (!levelValidation.valid) {
      return error(res, 'level 字段无效（必须是 L1-L5）')
    }

    const sheetValidation = sanitizeText(body.sheet || '', {
      maxLength: 50,
      allowEmpty: false,
    })
    if (!sheetValidation.valid) {
      return error(res, 'sheet 字段无效')
    }

    const presetValidation = sanitizeText(body.preset || '', { maxLength: 10000 })
    const skillValidation = sanitizeText(body.skill || '', { maxLength: 200 })
    const noteValidation = sanitizeText(body.note || '', { maxLength: 500 })
    const sourceValidation = sanitizeText(body.source || '用户添加', {
      maxLength: 100,
    })

    const imageDataValidation = sanitizeImageData(body.imageData || '')
    if (!imageDataValidation.valid) {
      return error(res, 'imageData 格式无效或文件过大（最大5MB）')
    }

    // 生成用例ID
    const id = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    // 创建用例
    const newCase = await prisma.case.create({
      data: {
        id,
        query: queryValidation.clean!,
        level: levelValidation.clean!,
        sheet: sheetValidation.clean!,
        source: sourceValidation.clean!,
        preset: presetValidation.clean || '',
        golden: goldenValidation.clean!,
        skill: skillValidation.clean || '',
        note: noteValidation.clean || '',
        imageData: imageDataValidation.clean || null,
        userAdded: true,
        favoriteCount: 0,
      },
    })

    return success(res, newCase, '用例添加成功')
  } catch (err) {
    console.error('创建用例失败:', err)
    return error(res, '创建用例失败', 500)
  }
}
