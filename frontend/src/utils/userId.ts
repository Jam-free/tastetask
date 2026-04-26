/**
 * 用户ID 工具
 * 生成并持久化用户唯一标识
 */

const USER_ID_KEY = 'tt_user_id'

/**
 * 生成兼容的 UUID
 * 使用简单的 fallback 方案，兼容旧浏览器
 */
function generateUUID(): string {
  // 尝试使用 crypto.randomUUID()
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // fallback: 手动生成 UUID v4 格式
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 获取或创建用户ID
 */
export function getOrCreateUserId(): string {
  try {
    // 尝试从 localStorage 获取
    let userId = localStorage.getItem(USER_ID_KEY)

    if (!userId) {
      // 生成新的 UUID
      userId = generateUUID()
      localStorage.setItem(USER_ID_KEY, userId)
    }

    return userId
  } catch (error) {
    // 如果 localStorage 不可用，生成临时 UUID
    console.warn('localStorage unavailable, using temporary UUID')
    return generateUUID()
  }
}

/**
 * 获取当前用户ID（不创建新的）
 */
export function getUserId(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY)
  } catch {
    return null
  }
}

/**
 * 设置用户ID
 */
export function setUserId(userId: string): void {
  try {
    localStorage.setItem(USER_ID_KEY, userId)
  } catch {
    // ignore
  }
}

/**
 * 清除用户ID
 */
export function clearUserId(): void {
  try {
    localStorage.removeItem(USER_ID_KEY)
  } catch {
    // ignore
  }
}
