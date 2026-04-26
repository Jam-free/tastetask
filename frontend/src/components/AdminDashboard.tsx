import { useState, useEffect } from 'react'
import { CaseLevel, CaseSheet } from '../types'
import { LevelBadge, SheetBadge } from './Badges'

interface AdminStats {
  overview: {
    totalCases: number
    userCases: number
    totalFavorites: number
    activeUsers: number
  }
  byLevel: { level: string; count: number }[]
  bySheet: { sheet: string; count: number }[]
  recentCases: Array<{
    id: string
    query: string
    level: CaseLevel
    sheet: string
    userAdded: boolean
    createdAt: string
    favoriteCount: number
  }>
  popularCases: Array<{
    id: string
    query: string
    level: CaseLevel
    sheet: string
    favoriteCount: number
  }>
}

interface AdminDashboardProps {
  token: string
  onLogout: () => void
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'favorites'>('overview')
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [token])

  const loadStats = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401 || response.status === 403) {
        setError('认证失败，请重新登录')
        onLogout()
        return
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || '加载数据失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCase = async (id: string) => {
    if (!confirm('确定要删除这个用例吗？')) return

    try {
      const response = await fetch(`/api/admin/cases/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        alert('删除成功')
        loadStats()
      } else {
        alert(data.error || '删除失败')
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
        加载中...
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--heart)' }}>
        {error}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div style={{ padding: '16px 20px' }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>管理员仪表盘</h2>
        <button
          className="nav-btn"
          onClick={onLogout}
          style={{ padding: '6px 14px' }}
        >
          退出登录
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="n">{stats.overview.totalCases}</div>
          <div className="l">总用例</div>
        </div>
        <div className="stat-card">
          <div className="n">{stats.overview.userCases}</div>
          <div className="l">用户添加</div>
        </div>
        <div className="stat-card">
          <div className="n">{stats.overview.totalFavorites}</div>
          <div className="l">总收藏</div>
        </div>
        <div className="stat-card">
          <div className="n">{stats.overview.activeUsers}</div>
          <div className="l">活跃用户</div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 20 }}>
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          数据概览
        </button>
        <button
          className={`nav-btn ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('cases')}
        >
          最近用例
        </button>
        <button
          className={`nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          热门用例
        </button>
      </div>

      {/* 数据概览 */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* 按等级统计 */}
          <div className="add-form" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>按等级分布</h3>
            {stats.byLevel.map((item) => (
              <div
                key={item.level}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <LevelBadge level={item.level as CaseLevel} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.count}</span>
              </div>
            ))}
          </div>

          {/* 按数据源统计 */}
          <div className="add-form" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>按数据源分布</h3>
            {stats.bySheet.map((item) => (
              <div
                key={item.sheet}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                <SheetBadge sheet={item.sheet as any} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最近用例 */}
      {activeTab === 'cases' && (
        <div className="tbl-container">
          <table className="tbl">
            <thead>
              <tr>
                <th>编号</th>
                <th>查询</th>
                <th>等级</th>
                <th>来源</th>
                <th>收藏</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCases.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.id}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.query}
                  </td>
                  <td><LevelBadge level={c.level} /></td>
                  <td>{c.userAdded ? '用户添加' : '预置'}</td>
                  <td>{c.favoriteCount}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCase(c.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 热门用例 */}
      {activeTab === 'favorites' && (
        <div className="tbl-container">
          <table className="tbl">
            <thead>
              <tr>
                <th>排名</th>
                <th>查询</th>
                <th>等级</th>
                <th>数据源</th>
                <th>收藏数</th>
              </tr>
            </thead>
            <tbody>
              {stats.popularCases.map((c, index) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>#{index + 1}</td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.query}
                  </td>
                  <td><LevelBadge level={c.level} /></td>
                  <td><SheetBadge sheet={c.sheet as CaseSheet} /></td>
                  <td style={{ fontWeight: 500, color: 'var(--heart)' }}>
                    💜 {c.favoriteCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
