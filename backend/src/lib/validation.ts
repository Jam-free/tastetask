/**
 * 输入验证和清理工具
 */

/**
 * 验证并清理用例ID
 */
export function validateCaseId(id: string): { valid: boolean; clean?: string } {
  if (!id || typeof id !== 'string') {
    return { valid: false }
  }

  // 检查格式：XY-01, USR-xxx-xxx
  const validFormat = /^[A-Z]{2}-\d{2}$|^[A-Z]{3}-[\dA-Za-z-]+$/.test(id)

  if (!validFormat) {
    return { valid: false }
  }

  // 限制长度
  if (id.length > 50) {
    return { valid: false }
  }

  return { valid: true, clean: id }
}

/**
 * 验证等级
 */
export function validateLevel(level: string): { valid: boolean; clean?: string } {
  const validLevels = ['L1', 'L2', 'L3', 'L4', 'L5']

  if (!validLevels.includes(level)) {
    return { valid: false }
  }

  return { valid: true, clean: level }
}

/**
 * 验证并清理文本输入
 */
export function sanitizeText(
  input: string,
  options: {
    maxLength?: number
    trim?: boolean
    allowEmpty?: boolean
  } = {}
): { valid: boolean; clean?: string } {
  const {
    maxLength = 10000,
    trim = true,
    allowEmpty = false,
  } = options

  if (typeof input !== 'string') {
    return { valid: false }
  }

  let clean = input

  // 移除控制字符（保留换行和制表符）
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  if (trim) {
    clean = clean.trim()
  }

  if (!allowEmpty && clean.length === 0) {
    return { valid: false }
  }

  if (clean.length > maxLength) {
    return { valid: false }
  }

  return { valid: true, clean }
}

/**
 * 验证并清理图片base64数据
 */
export function sanitizeImageData(data: string): { valid: boolean; clean?: string | null } {
  if (!data || typeof data !== 'string') {
    return { valid: true, clean: null }
  }

  // 检查是否是有效的data URL
  const dataUrlRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,[A-Za-z0-9+/]+=*$/

  if (!dataUrlRegex.test(data)) {
    return { valid: false }
  }

  // 限制大小（约5MB）
  const base64Data = data.split(',')[1]
  const sizeInBytes = Math.ceil((base64Data.length * 3) / 4)

  if (sizeInBytes > 5 * 1024 * 1024) {
    return { valid: false }
  }

  return { valid: true, clean: data }
}

/**
 * 验证分页参数
 */
export function validatePagination(params: {
  page?: any
  limit?: any
}): { valid: boolean; page?: number; limit?: number } {
  let page = 1
  let limit = 30

  if (params.page !== undefined) {
    page = parseInt(params.page, 10)
    if (isNaN(page) || page < 1 || page > 10000) {
      return { valid: false }
    }
  }

  if (params.limit !== undefined) {
    limit = parseInt(params.limit, 10)
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return { valid: false }
    }
  }

  return { valid: true, page, limit }
}

/**
 * 验证UUID格式
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * 防止XSS攻击的HTML转义
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
