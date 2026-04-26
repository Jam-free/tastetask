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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  // Swipe state
  const trackRef = useRef<HTMLDivElement>(null)
  const [swiping, setSwiping] = useState(false)
  const swipeStartX = useRef(0)
  const swipeStartTime = useRef(0)
  const swipeDelta = useRef(0)
  const [swipeOffset, setSwipeOffset] = useState(0)

  const userId = getOrCreateUserId()

  const showToastMsg = (msg: string) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2500)
  }

  const toggleFavorite = useCallback(async (caseId: string) => {
    const isFav = favoriteIds.has(caseId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isFav) next.delete(caseId)
      else next.add(caseId)
      return next
    })
    try {
      await fetch(`/api/cases/${caseId}/favorite`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'X-User-Id': userId },
      })
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFav) next.add(caseId)
        else next.delete(caseId)
        return next
      })
    }
  }, [favoriteIds, userId])

  const total = cases.length

  const goTo = (index: number) => {
    if (animating || index < 0 || index >= total) return
    setAnimating(true)
    setCurrentIndex(index)
    setSwipeOffset(0)
    setTimeout(() => setAnimating(false), 350)
  }

  const goNext = () => goTo(currentIndex + 1)
  const goPrev = () => goTo(currentIndex - 1)

  // Touch swipe handlers
  const onSwipeStart = (clientX: number) => {
    swipeStartX.current = clientX
    swipeStartTime.current = Date.now()
    setSwiping(true)
  }

  const onSwipeMove = (clientX: number) => {
    if (!swiping) return
    const dx = clientX - swipeStartX.current
    swipeDelta.current = dx
    setSwipeOffset(dx)
  }

  const onSwipeEnd = () => {
    setSwiping(false)
    const dx = swipeDelta.current
    const elapsed = Date.now() - swipeStartTime.current
    const velocity = Math.abs(dx) / Math.max(elapsed, 1)
    const cardWidth = trackRef.current?.offsetWidth || 320
    const threshold = Math.max(cardWidth * 0.25, 60)

    if (Math.abs(dx) > threshold || (velocity > 0.4 && Math.abs(dx) > 20)) {
      if (dx > 0) goPrev()
      else goNext()
    } else {
      setSwipeOffset(0)
    }
    swipeDelta.current = 0
  }

  // Reset index when cases change
  useEffect(() => {
    setCurrentIndex(0)
    setSwipeOffset(0)
  }, [cases.length])

  // Track translate = -(index * 100%) + swipeOffset
  const trackStyle: React.CSSProperties = {
    transform: swiping
      ? `translateX(calc(-${currentIndex * 100}% + ${swipeOffset}px))`
      : `translateX(-${currentIndex * 100}%)`,
    transition: swiping ? 'none' : 'transform .35s cubic-bezier(.22,1,.36,1)',
  }

  return (
    <div className="cards-page">
      {/* Top bar */}
      <div className="cards-top">
        <span className="cards-count">{total} 条测试用例</span>
        <button className="shuffle-btn" onClick={() => onShuffle?.()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          换一批
        </button>
      </div>

      {/* Banner carousel */}
      <div className="banner-wrap">
        {/* Edge arrows */}
        <button className="banner-arrow banner-arrow-left" onClick={goPrev} disabled={currentIndex <= 0} aria-label="上一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="banner-arrow banner-arrow-right" onClick={goNext} disabled={currentIndex >= total - 1} aria-label="下一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Track */}
        <div className="banner-track-wrap">
          <div className="banner-track" ref={trackRef} style={trackStyle}
            onMouseDown={(e) => onSwipeStart(e.clientX)}
            onMouseMove={(e) => swiping && onSwipeMove(e.clientX)}
            onMouseUp={onSwipeEnd}
            onMouseLeave={swiping ? onSwipeEnd : undefined}
            onTouchStart={(e) => onSwipeStart(e.touches[0].clientX)}
            onTouchMove={(e) => swiping && onSwipeMove(e.touches[0].clientX)}
            onTouchEnd={onSwipeEnd}
          >
            {cases.map((c, i) => (
              <div key={i} className="banner-card">
                <div className="banner-header">
                  <div className="banner-meta">
                    <LevelBadge level={c.level} />
                    <SheetBadge sheet={c.sheet} />
                  </div>
                  <button
                    className={`fav-btn ${favoriteIds.has(c.id) ? 'on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(c.id) }}
                  >
                    {favoriteIds.has(c.id) ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
                  </button>
                </div>

                <div className="banner-body">
                  <div className="banner-query">{c.query}</div>

                  <div className="banner-section">
                    <div className="banner-section-head">
                      <span className="banner-section-label">预设数据</span>
                      <button className="banner-copy-btn" onClick={() => {
                        navigator.clipboard.writeText(c.preset || '')
                        showToastMsg('已复制预设数据')
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        复制
                      </button>
                    </div>
                    <div className="banner-section-text">{c.preset}</div>
                  </div>

                  <div className="banner-section">
                    <div className="banner-section-label">预期回答</div>
                    <div className="banner-section-text golden">{c.golden}</div>
                  </div>

                  {c.imageData && (
                    <img src={c.imageData} className="banner-img" alt="附图" />
                  )}
                </div>

                <div className="banner-footer">
                  <span className="banner-source"><PinIcon size={11} /> {c.source}</span>
                  <button
                    className="assistant-btn-sm"
                    onClick={async (e) => {
                      e.stopPropagation()
                      const r = await sendQueryToAssistant(c.query)
                      showToastMsg(r.device === 'huawei' ? '已复制，可唤醒小艺粘贴提问' : '已复制到剪贴板')
                    }}
                  >
                    <MicIcon size={12} /> 发到助手
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page indicator */}
        <div className="banner-page-indicator">
          {total > 0 ? `${currentIndex + 1} / ${total}` : '0 / 0'}
        </div>
      </div>

      {/* Empty state when no cards */}
      {total === 0 && (
        <div className="banner-empty">
          <div className="banner-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
          </div>
          <div className="banner-empty-text">没有更多用例</div>
          <button className="shuffle-btn" onClick={() => onShuffle?.()}>换一批</button>
        </div>
      )}

      {/* Add button */}
      <button className="add-case-btn" onClick={() => setShowAddSheet(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        添加测试用例
      </button>

      {/* Toast */}
      {toast && <div className="toast-bar">{toast}</div>}

      {/* Add sheet */}
      <AddSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onSubmit={(data) => { onAdd(data); setShowAddSheet(false) }}
      />
    </div>
  )
}
