import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { success, error } from '../lib/api-utils.js'

/**
 * POST /api/cases/:id/favorite
 * 收藏用例
 */
export async function addFavorite(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId) {
      return error(res, '需要登录', 401)
    }

    // 检查用例是否存在
    const caseItem = await prisma.case.findUnique({
      where: { id },
    })

    if (!caseItem) {
      return error(res, '用例不存在', 404)
    }

    // 创建或查找收藏（利用unique约束避免重复）
    await prisma.favorite.upsert({
      where: {
        caseId_userId: {
          caseId: id,
          userId,
        },
      },
      create: {
        caseId: id,
        userId,
      },
      update: {},
    })

    // 更新收藏计数
    await prisma.case.update({
      where: { id },
      data: {
        favoriteCount: {
          increment: 1,
        },
      },
    })

    return success(res, null, '已收藏')
  } catch (err) {
    console.error('收藏失败:', err)
    return error(res, '收藏失败', 500)
  }
}

/**
 * DELETE /api/cases/:id/favorite
 * 取消收藏
 */
export async function removeFavorite(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId) {
      return error(res, '需要登录', 401)
    }

    // 查找并删除收藏
    const favorite = await prisma.favorite.findUnique({
      where: {
        caseId_userId: {
          caseId: id,
          userId,
        },
      },
    })

    if (!favorite) {
      return error(res, '未收藏该用例', 404)
    }

    await prisma.favorite.delete({
      where: {
        caseId_userId: {
          caseId: id,
          userId,
        },
      },
    })

    // 更新收藏计数
    await prisma.case.update({
      where: { id },
      data: {
        favoriteCount: {
          decrement: 1,
        },
      },
    })

    return success(res, null, '已取消收藏')
  } catch (err) {
    console.error('取消收藏失败:', err)
    return error(res, '取消收藏失败', 500)
  }
}

/**
 * GET /api/favorites
 * 获取用户的收藏列表
 */
export async function getFavorites(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.userId

    if (!userId) {
      return error(res, '需要登录', 401)
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 30)
    const skip = (page - 1) * pageSize

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          case: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where: { userId } }),
    ])

    const cases = favorites.map(f => ({
      ...f.case,
      isFavorited: true,
      favoritedAt: f.createdAt,
    }))

    return success(res, {
      cases,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error('获取收藏列表失败:', err)
    return error(res, '获取收藏列表失败', 500)
  }
}
