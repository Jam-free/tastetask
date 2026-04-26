import { Case } from '../types'
import { LevelBadge, SheetBadge } from './Badges'
import { HeartFilledIcon } from './Icons'

interface FavoritesViewProps {
  cases: Case[]
}

export function FavoritesView({ cases }: FavoritesViewProps) {
  if (cases.length === 0) {
    return (
      <div className="empty">
        <p>还没有收藏的用例</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>
          在卡片视图中点击 <HeartFilledIcon size={12} style={{verticalAlign:'middle',color:'var(--heart)'}} /> 即可收藏
        </p>
      </div>
    )
  }

  return (
    <div className="table-wrap" style={{ marginTop: 0 }}>
      <div style={{ padding: '14px 16px', color: 'var(--text-tertiary)', fontSize: 13 }}>
        已收藏 {cases.length} 条用例
      </div>

      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>编号</th>
              <th style={{ width: 56 }}>等级</th>
              <th>查询 Query</th>
              <th style={{ width: 110 }}>数据源</th>
              <th style={{ width: 72 }}>详情</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id}>
                <td
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {c.userAdded && <span className="user-dot" />}
                  {c.id}
                </td>
                <td>
                  <LevelBadge level={c.level} />
                </td>
                <td style={{ fontWeight: 500 }}>{c.query}</td>
                <td>
                  <SheetBadge sheet={c.sheet} />
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--heart)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <HeartFilledIcon size={12} /> {c.favoriteCount || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
