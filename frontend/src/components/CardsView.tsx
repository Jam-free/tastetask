import { useState, useCallback, useRef, useEffect } from 'react'
import { Case } from '../types'
import { LevelBadge, SheetBadge } from './Badges'
import { getOrCreateUserId } from '../utils/userId'
import { sendQueryToAssistant } from '../utils/voiceAssistant'
import { AddSheet } from './AddSheet'
import {
  HeartIcon,
  HeartFilledIcon,
  PinIcon,
  MicIcon,
} from './Icons'

interface CardsViewProps {
  cases: Case[]
  onShuffle?: () => void
  onAdd: (newCase: Partial<Case>) => void
}

export function CardsView({ cases, onShuffle, onAdd }: CardsViewProps) {
  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  // Swipe
  const cardRef = useRef<HTMLDivElement>(null)
  const [swiping, setSwiping] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const sx = useRef(0)
  const st = useRef(0)
  const sd = useRef(0)

  const userId = getOrCreateUserId()
  const toastIt = (m: string) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2500) }

  const toggleFav = useCallback(async (id: string) => {
    const on = favoriteIds.has(id)
    setFavoriteIds(p => { const n = new Set(p); on ? n.delete(id) : n.add(id); return n })
    try { await fetch(`/api/cases/${id}/favorite`, { method: on ? 'DELETE' : 'POST', headers: { 'X-User-Id': userId } }) }
    catch { setFavoriteIds(p => { const n = new Set(p); on ? n.add(id) : n.delete(id); return n }) }
  }, [favoriteIds, userId])

  const total = cases.length
  const card = cases[index]

  const go = (to: number) => {
    if (animating || to < 0 || to >= total) return
    setAnimDir(to > index ? 'left' : 'right')
    setAnimating(true)
    setTimeout(() => {
      setIndex(to)
      setAnimating(false)
      setAnimDir(null)
    }, 200)
  }
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  const onTouchStart = (e: React.TouchEvent) => { sx.current = e.touches[0].clientX; st.current = Date.now(); setSwiping(true) }
  const onTouchMove = (e: React.TouchEvent) => { if (!swiping) return; const d = e.touches[0].clientX - sx.current; sd.current = d; setSwipeX(d) }
  const onTouchEnd = () => {
    setSwiping(false); setSwipeX(0)
    const d = sd.current; const v = Math.abs(d) / Math.max(Date.now() - st.current, 1)
    const w = cardRef.current?.offsetWidth || 320
    if (Math.abs(d) > w * 0.25 || (v > 0.4 && Math.abs(d) > 20)) { d > 0 ? prev() : next() }
    sd.current = 0
  }

  useEffect(() => { setIndex(0); setAnimDir(null); setAnimating(false) }, [cases.length])

  // 卡片的滑动/动画样式
  let cardTransform = ''
  let cardTransition = ''
  if (swiping) {
    cardTransform = `translateX(${swipeX}px)`
    cardTransition = 'none'
  } else if (animating) {
    cardTransform = animDir === 'left' ? 'translateX(-30px)' : 'translateX(30px)'
    cardTransition = 'transform .2s ease, opacity .2s ease'
  }
  // 进场：新卡片从反方向滑入
  const entering = !swiping && animating

  return (
    <div className="cards-page">
      {/* Top bar */}
      <div className="cards-top">
        <span className="cards-count">{total} 条测试用例</span>
        <button className="shuffle-btn" onClick={() => onShuffle?.()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          换一批
        </button>
      </div>

      {/* Card area */}
      <div className="banner-wrap">
        {/* Edge arrows */}
        <button className="banner-arrow banner-arrow-left" onClick={prev} disabled={index <= 0} aria-label="上一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button className="banner-arrow banner-arrow-right" onClick={next} disabled={index >= total - 1} aria-label="下一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        <div className="banner-viewport">
          <div
            ref={cardRef}
            className="banner-card"
            style={{ transform: cardTransform, transition: cardTransition, opacity: entering ? 0 : 1 }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {card ? (
              <>
                <div className="banner-header">
                  <div className="banner-meta">
                    <LevelBadge level={card.level} />
                    <SheetBadge sheet={card.sheet} />
                  </div>
                  <button className={`fav-btn ${favoriteIds.has(card.id) ? 'on' : ''}`} onClick={e => { e.stopPropagation(); toggleFav(card.id) }}>
                    {favoriteIds.has(card.id) ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
                  </button>
                </div>

                <div className="banner-body">
                  <div className="banner-query">{card.query}</div>

                  <div className="banner-section">
                    <div className="banner-section-head">
                      <span className="banner-section-label">预设数据</span>
                      <button className="banner-copy-btn" onClick={() => { navigator.clipboard.writeText(card.preset || ''); toastIt('已复制预设数据') }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                        复制
                      </button>
                    </div>
                    <div className="banner-section-text">{card.preset}</div>
                  </div>

                  <div className="banner-section">
                    <div className="banner-section-label">预期回答</div>
                    <div className="banner-section-text golden">{card.golden}</div>
                  </div>

                  {card.imageData && <img src={card.imageData} className="banner-img" alt="附图" />}
                </div>

                <div className="banner-footer">
                  <span className="banner-source"><PinIcon size={11} /> {card.source}</span>
                  <button className="assistant-btn-sm" onClick={async e => { e.stopPropagation(); const r = await sendQueryToAssistant(card.query); toastIt(r.device === 'huawei' ? '已复制，可唤醒小艺粘贴提问' : '已复制到剪贴板') }}>
                    <MicIcon size={12} /> 发到助手
                  </button>
                </div>
              </>
            ) : (
              <div className="banner-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: .4, color: 'var(--text-tertiary)' }}><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                <div className="banner-empty-text">没有更多用例</div>
                <button className="shuffle-btn" onClick={() => onShuffle?.()}>换一批</button>
              </div>
            )}
          </div>
        </div>

        <div className="banner-page-indicator">{total > 0 ? `${index + 1} / ${total}` : '0 / 0'}</div>
      </div>

      <button className="add-case-btn" onClick={() => setShowAddSheet(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加测试用例
      </button>

      {toast && <div className="toast-bar">{toast}</div>}

      <AddSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} onSubmit={d => { onAdd(d); setShowAddSheet(false) }} />
    </div>
  )
}
