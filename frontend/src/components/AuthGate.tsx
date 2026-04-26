import { useState } from 'react'

interface AuthGateProps {
  onPass: () => void
}

const CORRECT_ANSWER = '陈建辉'

/**
 * 进入网站前的认证问题
 */
export function AuthGate({ onPass }: AuthGateProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === CORRECT_ANSWER) {
      localStorage.setItem('tt_auth_pass', '1')
      onPass()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="auth-gate">
      <div className={`auth-box${shake ? ' shake' : ''}`}>
        <div className="auth-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="auth-title">验证身份</h2>
        <p className="auth-desc">
          谁把这个网站分享给你？
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            className={`auth-input${error ? ' error' : ''}`}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false) }}
            placeholder="请输入分享者的名字"
            autoFocus
            autoComplete="off"
          />
          {error && (
            <p className="auth-error">答案不正确，请再想想</p>
          )}
          <button
            type="submit"
            className="auth-submit"
            disabled={!input.trim()}
          >
            进入
          </button>
        </form>
      </div>
    </div>
  )
}
