import { useState } from 'react'
import { Case, CaseLevel } from '../types'
import { LevelBadge, SheetBadge } from './Badges'
import { sendQueryToAssistant } from '../utils/voiceAssistant'

interface TableViewProps {
  cases: Case[]
}

export function TableView({ cases }: TableViewProps) {
  const [lvFilter, setLvFilter] = useState<string>('all')
  const [shFilter, setShFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState('')

  const sheets = Array.from(new Set(cases.map((c) => c.sheet)))

  const filtered = cases.filter(
    (c) =>
      (lvFilter === 'all' || c.level === lvFilter) &&
      (shFilter === 'all' || c.sheet === shFilter)
  )

  const levels: (CaseLevel | 'all')[] = ['all', 'L1', 'L2', 'L3', 'L4', 'L5']

  return (
    <div className="table-wrap">
      <div className="filter-row">
        <select
          className="filter-select"
          value={lvFilter}
          onChange={(e) => setLvFilter(e.target.value)}
        >
          <option value="all">全部等级</option>
          {levels.slice(1).map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={shFilter}
          onChange={(e) => setShFilter(e.target.value)}
        >
          <option value="all">全部来源</option>
          {sheets.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <span
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            marginLeft: 'auto',
          }}
        >
          {filtered.length} 条
        </span>
      </div>

      <div className="tbl-container">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>编号</th>
              <th style={{ width: 56 }}>等级</th>
              <th>查询 Query</th>
              <th className="col-source" style={{ width: 110 }}>数据源</th>
              <th style={{ width: 72 }}>详情</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => [
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
                <td className="col-source">
                  <SheetBadge sheet={c.sheet} />
                </td>
                <td>
                  <button
                    className="expand-btn"
                    onClick={() =>
                      setExpanded(expanded === c.id ? null : c.id)
                    }
                  >
                    {expanded === c.id ? '收起' : '展开'}
                  </button>
                </td>
              </tr>,
              expanded === c.id && (
                <tr key={`${c.id}_d`}>
                  <td
                    colSpan={5}
                    style={{
                      padding: 0,
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <div className="expand-detail">
                      <div className="expand-grid">
                        <div>
                          <div className="expand-label">预设数据</div>
                          <div className="expand-val">{c.preset}</div>
                        </div>
                        <div>
                          <div className="expand-label">Golden Answer</div>
                          <div className="expand-val">{c.golden}</div>
                        </div>
                        <div>
                          <div className="expand-label">考察能力</div>
                          <div className="expand-val">{c.skill}</div>
                        </div>
                        <div>
                          <div className="expand-label">难点备注</div>
                          <div className="expand-val">{c.note}</div>
                        </div>
                        {c.imageData && (
                          <div style={{ gridColumn: '1/-1' }}>
                            <div className="expand-label">附图</div>
                            <img
                              src={c.imageData}
                              style={{
                                maxWidth: 220,
                                borderRadius: 8,
                                marginTop: 4,
                              }}
                              alt=""
                            />
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <button
                          className="assistant-btn"
                          onClick={() => {
                            sendQueryToAssistant(c.query).then((r) => {
                              setToastMsg('已复制到剪贴板' + (r.device === 'huawei' ? '，可唤醒小艺粘贴提问' : ''))
                              setTimeout(() => setToastMsg(''), 2500)
                            })
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                          </svg>
                          发到助手
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ),
            ])}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="empty">没有符合条件的用例</div>
        )}
      </div>

      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,.85)',
            color: '#fff',
            padding: '10px 22px',
            borderRadius: 24,
            fontSize: 13,
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  )
}
