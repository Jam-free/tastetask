import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { parseCaseFilter, success, error } from '../lib/api-utils.js'

/**
 * GET /api/cases
 * 获取用例列表
 * 支持按等级、数据源过滤，支持随机抽取
 */
export async function getCases(req: Request, res: Response): Promise<void> {
  try {
    const { level, sheet, random, limit = 30 } = parseCaseFilter(req)
    const userId = req.userId

    // 构建查询条件
    const where: any = {
      deletedAt: null,
    }

    if (level) {
      where.level = level
    }

    if (sheet) {
      where.sheet = sheet
    }

    // 如果传了 random 参数，随机抽取指定数量的用例
    if (random) {
      // 获取所有符合条件的用例ID
      const allCases = await prisma.case.findMany({
        where,
        select: { id: true },
      })

      // 随机打乱并限制数量
      const shuffled = allCases.sort(() => Math.random() - 0.5)
      const selectedIds = shuffled.slice(0, limit).map(c => c.id)

      // 获取完整数据
      const cases = await prisma.case.findMany({
        where: { id: { in: selectedIds } },
        orderBy: { id: 'asc' },
      })

      // 为每个用例添加当前用户的收藏状态
      const casesWithFavorite = await addFavoriteStatus(cases, userId)

      return success(res, casesWithFavorite)
    }

    // 普通分页查询
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(100, limit)
    const skip = (page - 1) * pageSize

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      prisma.case.count({ where }),
    ])

    const casesWithFavorite = await addFavoriteStatus(cases, userId)

    return success(res, {
      cases: casesWithFavorite,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error('获取用例列表失败:', err)
    return error(res, '获取用例列表失败', 500)
  }
}

/**
 * 为用例列表添加当前用户的收藏状态
 */
async function addFavoriteStatus(
  cases: any[],
  userId: string | undefined
): Promise<any[]> {
  if (!userId || cases.length === 0) {
    return cases.map(c => ({ ...c, isFavorited: false }))
  }

  const caseIds = cases.map(c => c.id)
  const favorites = await prisma.favorite.findMany({
    where: {
      caseId: { in: caseIds },
      userId,
    },
    select: { caseId: true },
  })

  const favoritedIds = new Set(favorites.map(f => f.caseId))

  return cases.map(c => ({
    ...c,
    isFavorited: favoritedIds.has(c.id),
  }))
}

/**
 * GET /api/cases/stats
 * 获取用例统计信息
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const [total, byLevel, bySheet] = await Promise.all([
      prisma.case.count({ where: { deletedAt: null } }),
      prisma.case.groupBy({
        by: ['level'],
        where: { deletedAt: null },
        _count: { level: true },
      }),
      prisma.case.groupBy({
        by: ['sheet'],
        where: { deletedAt: null },
        _count: { sheet: true },
      }),
    ])

    return success(res, {
      total,
      byLevel: byLevel.map(item => ({
        level: item.level,
        count: item._count.level,
      })),
      bySheet: bySheet.map(item => ({
        sheet: item.sheet,
        count: item._count.sheet,
      })),
    })
  } catch (err) {
    console.error('获取统计信息失败:', err)
    return error(res, '获取统计信息失败', 500)
  }
}
