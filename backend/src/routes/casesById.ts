import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { success, error } from '../lib/api-utils.js'

/**
 * GET /api/cases/:id
 * 获取单个用例详情
 */
export async function getCaseById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = req.userId

    const caseItem = await prisma.case.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!caseItem) {
      return error(res, '用例不存在', 404)
    }

    // 检查用户是否收藏了该用例
    let isFavorited = false
    if (userId) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          caseId_userId: {
            caseId: id,
            userId,
          },
        },
      })
      isFavorited = !!favorite
    }

    return success(res, {
      ...caseItem,
      isFavorited,
    })
  } catch (err) {
    console.error('获取用例详情失败:', err)
    return error(res, '获取用例详情失败', 500)
  }
}

/**
 * DELETE /api/cases/:id
 * 删除用例（软删除，仅限用户添加的用例）
 */
export async function deleteCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId) {
      return error(res, '需要登录', 401)
    }

    const caseItem = await prisma.case.findUnique({
      where: { id },
    })

    if (!caseItem) {
      return error(res, '用例不存在', 404)
    }

    // 只允许删除用户添加的用例
    if (!caseItem.userAdded) {
      return error(res, '不能删除预置用例', 403)
    }

    // 软删除
    await prisma.case.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return success(res, null, '用例已删除')
  } catch (err) {
    console.error('删除用例失败:', err)
    return error(res, '删除用例失败', 500)
  }
}
