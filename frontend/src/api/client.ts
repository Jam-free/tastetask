/**
 * API 客户端封装
 * 自动添加 X-User-Id header，处理请求错误
 */

const API_BASE = '/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

/**
 * 通用 fetch 封装
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = getUserId()

  const url = `${API_BASE}${endpoint}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  // 添加用户ID header
  if (userId) {
    headers['X-User-Id'] = userId
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // 处理 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('请求失败')
  }
}

/**
 * 获取当前用户ID
 */
function getUserId(): string | null {
  try {
    return localStorage.getItem('tt_user_id')
  } catch {
    return null
  }
}

/**
 * 设置用户ID
 */
export function setUserId(userId: string): void {
  try {
    localStorage.setItem('tt_user_id', userId)
  } catch {
    // ignore
  }
}

/**
 * GET 请求
 */
export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' })
}

/**
 * POST 请求
 */
export function post<T>(endpoint: string, data: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT 请求
 */
export function put<T>(endpoint: string, data: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE 请求
 */
export function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' })
}

/**
 * 上传文件（multipart/form-data）
 */
export async function upload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const userId = getUserId()
  const url = `${API_BASE}${endpoint}`

  const headers: HeadersInit = {}
  if (userId) {
    headers['X-User-Id'] = userId
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }

  return data
}
