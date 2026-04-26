import { useState, useEffect, useCallback } from 'react'
import { getOrCreateUserId } from './utils/userId'
import { Case, TabType } from './types'
import { CardsView } from './components/CardsView'
import { TableView } from './components/TableView'
import { FavoritesView } from './components/FavoritesView'
import { LevelModal } from './components/LevelModal'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import { AuthGate } from './components/AuthGate'
import './styles/index.css'

type TabTypeWithAdmin = TabType | 'admin'

function App() {
  const [tab, setTab] = useState<TabTypeWithAdmin>('cards')
  const [cases, setCases] = useState<Case[]>([])
  const [favorites, setFavorites] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [userId] = useState(() => getOrCreateUserId())
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('tt_auth_pass'))

  // 加载用例数据
  const loadCases = useCallback(async (random = false) => {
    setLoading(true)
    try {
      const randomParam = random ? '?random=true&limit=30' : ''
      const response = await fetch(`/api/cases${randomParam}`)
      const data = await response.json()

      if (data.success) {
        if (random) {
          setCases(data.data)
        } else {
          setCases(data.data.cases || [])
        }
      }
    } catch (err) {
      console.error('加载用例失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 加载收藏列表
  const loadFavorites = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'X-User-Id': userId,
        },
      })
      const data = await response.json()

      if (data.success) {
        setFavorites(data.data.cases || [])
      }
    } catch (err) {
      console.error('加载收藏失败:', err)
    }
  }, [userId])

  // 初始化加载
  useEffect(() => {
    loadCases(true) // 默认加载30条随机用例

    // 检查是否有保存的管理员token
    const savedToken = localStorage.getItem('tt_admin_token')
    if (savedToken) {
      setAdminToken(savedToken)
    }
  }, [loadCases])

  // 管理员登录成功
  const handleAdminLoginSuccess = (token: string) => {
    setAdminToken(token)
    setShowAdminLogin(false)
    setTab('admin')
  }

  // 管理员登出
  const handleAdminLogout = () => {
    localStorage.removeItem('tt_admin_token')
    setAdminToken(null)
    setTab('cards')
  }

  // 切换到收藏标签时加载收藏
  useEffect(() => {
    if (tab === 'favorites') {
      loadFavorites()
    }
  }, [tab, loadFavorites])

  // 刷新当前视图数据
  const refresh = () => {
    if (tab === 'favorites') {
      loadFavorites()
    } else if (tab === 'cards') {
      loadCases(true)
    } else {
      loadCases(false)
    }
  }

  // 添加用例
  const handleAddCase = async (newCase: Partial<Case>) => {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify(newCase),
      })
      const data = await response.json()

      if (data.success) {
        alert('✓ 已添加到测试集')
        refresh()
      } else {
        alert(data.error || '添加失败')
      }
    } catch (err) {
      console.error('添加用例失败:', err)
      alert('添加失败')
    }
  }

  if (!authed) {
    return <AuthGate onPass={() => setAuthed(true)} />
  }

  if (loading) {
    return (
      <div className="app">
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          加载中...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* 导航栏 */}
      <nav className="nav">
        <div className="brand">
          <div className="brand-mark">试</div>
          <div className="brand-name">Taste-Task</div>
          <div className="brand-sub">试金石 v2.0</div>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-btn ${tab === 'cards' ? 'active' : ''}`}
            onClick={() => setTab('cards')}
          >
            体验
          </button>
          <button
            className={`nav-btn ${tab === 'table' ? 'active' : ''}`}
            onClick={() => setTab('table')}
            title="全部用例"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            用例
          </button>
          <button
            className={`nav-btn ${tab === 'favorites' ? 'active' : ''}`}
            onClick={() => setTab('favorites')}
            title="我的收藏"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            收藏
          </button>
        </div>

        <div className="nav-icons">
          <button
            className="icon-btn"
            onClick={() => setShowLevelModal(true)}
            title="等级说明"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
          {adminToken ? (
            <button
              className="icon-btn admin-on"
              onClick={() => setTab('admin')}
              title="管理员后台"
            >
              <span className="admin-dot" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          ) : (
            <button
              className="icon-btn"
              onClick={() => setShowAdminLogin(true)}
              title="管理员登录"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* 内容区域 */}
      {tab === 'admin' ? (
        <AdminDashboard token={adminToken!} onLogout={handleAdminLogout} />
      ) : (
        <>
          {tab === 'cards' && <CardsView cases={cases} onShuffle={() => loadCases(true)} onAdd={handleAddCase} />}
          {tab === 'table' && <TableView cases={cases} />}
          {tab === 'favorites' && <FavoritesView cases={favorites} />}
        </>
      )}

      {/* 等级说明模态框 */}
      <LevelModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
      />

      {/* 管理员登录模态框 */}
      {showAdminLogin && (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  )
}

export default App
