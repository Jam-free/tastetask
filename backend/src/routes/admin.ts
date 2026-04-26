import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { success, error } from '../lib/api-utils.js'
import { verifyAdmin } from './auth.js'

/**
 * GET /api/admin/stats
 * 获取管理员统计数据
 */
export async function getAdminStats(_req: Request, res: Response): Promise<void> {
  try {
    const [
      totalCases,
      userCases,
      totalFavorites,
      activeUsers,
      byLevel,
      bySheet,
      recentCases,
    ] = await Promise.all([
      // 总用例数
      prisma.case.count({ where: { deletedAt: null } }),
      // 用户添加的用例数
      prisma.case.count({ where: { userAdded: true, deletedAt: null } }),
      // 总收藏数
      prisma.favorite.count(),
      // 活跃用户数（有收藏行为的）
      prisma.favorite.groupBy({
        by: ['userId'],
      }).then((groups) => groups.length),
      // 按等级统计
      prisma.case.groupBy({
        by: ['level'],
        where: { deletedAt: null },
        _count: { level: true },
      }),
      // 按数据源统计
      prisma.case.groupBy({
        by: ['sheet'],
        where: { deletedAt: null },
        _count: { sheet: true },
      }),
      // 最近添加的用例
      prisma.case.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          query: true,
          level: true,
          sheet: true,
          userAdded: true,
          createdAt: true,
          favoriteCount: true,
        },
      }),
    ])

    // 获取最受欢迎的用例（收藏数最多）
    const popularCases = await prisma.case.findMany({
      where: { deletedAt: null },
      orderBy: { favoriteCount: 'desc' },
      take: 10,
      select: {
        id: true,
        query: true,
        level: true,
        sheet: true,
        favoriteCount: true,
      },
    })

    return success(res, {
      overview: {
        totalCases,
        userCases,
        totalFavorites,
        activeUsers,
      },
      byLevel: byLevel.map((item) => ({
        level: item.level,
        count: item._count.level,
      })),
      bySheet: bySheet.map((item) => ({
        sheet: item.sheet,
        count: item._count.sheet,
      })),
      recentCases,
      popularCases,
    })
  } catch (err) {
    console.error('获取管理员统计失败:', err)
    return error(res, '获取统计数据失败', 500)
  }
}

/**
 * GET /api/admin/cases
 * 获取所有用例（管理员视图，支持软删除的）
 */
export async function getAllCases(_req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(_req.query.page as string) || 1)
    const pageSize = Math.min(100, parseInt(_req.query.pageSize as string) || 50)
    const skip = (page - 1) * pageSize

    const includeDeleted = _req.query.includeDeleted === 'true'

    const where: any = {}
    if (!includeDeleted) {
      where.deletedAt = null
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          query: true,
          level: true,
          sheet: true,
          source: true,
          userAdded: true,
          favoriteCount: true,
          createdAt: true,
          deletedAt: true,
        },
      }),
      prisma.case.count({ where }),
    ])

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
    console.error('获取用例列表失败:', err)
    return error(res, '获取用例列表失败', 500)
  }
}

/**
 * DELETE /api/admin/cases/:id
 * 管理员删除用例（软删除，包括预置用例）
 */
export async function adminDeleteCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const caseItem = await prisma.case.findUnique({
      where: { id },
    })

    if (!caseItem) {
      return error(res, '用例不存在', 404)
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

/**
 * POST /api/admin/cases/:id/restore
 * 管理员恢复已删除的用例
 */
export async function restoreCase(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const caseItem = await prisma.case.findUnique({
      where: { id },
    })

    if (!caseItem) {
      return error(res, '用例不存在', 404)
    }

    if (!caseItem.deletedAt) {
      return error(res, '该用例未被删除', 400)
    }

    await prisma.case.update({
      where: { id },
      data: { deletedAt: null },
    })

    return success(res, null, '用例已恢复')
  } catch (err) {
    console.error('恢复用例失败:', err)
    return error(res, '恢复用例失败', 500)
  }
}

/**
 * GET /api/admin/favorites
 * 获取所有用户的收藏记录
 */
export async function getAllFavorites(_req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(_req.query.page as string) || 1)
    const pageSize = Math.min(100, parseInt(_req.query.pageSize as string) || 50)
    const skip = (page - 1) * pageSize

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          case: {
            select: {
              id: true,
              query: true,
              level: true,
              sheet: true,
            },
          },
        },
      }),
      prisma.favorite.count(),
    ])

    return success(res, {
      favorites,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    console.error('获取收藏记录失败:', err)
    return error(res, '获取收藏记录失败', 500)
  }
}
