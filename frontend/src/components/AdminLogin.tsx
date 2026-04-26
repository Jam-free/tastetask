import { useState } from 'react'

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void
  onCancel: () => void
}

export function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('tt_admin_token', data.data.token)
        onLoginSuccess(data.data.token)
      } else {
        setError(data.error || '登录失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">管理员登录</h3>
          <button className="modal-close" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">管理员密码</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                background: '#FEF2F2',
                color: '#991B1B',
                borderRadius: 8,
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="nav-btn"
                onClick={onCancel}
                style={{ flex: 1, padding: '10px', textAlign: 'center', border: '1px solid var(--border-mid)' }}
              >
                取消
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || !password}
                style={{ flex: 1, opacity: isLoading || !password ? 0.6 : 1 }}
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
