import { useState, useCallback, useRef } from 'react'
import { Case } from '../types'
import { LevelBadge, SheetBadge } from './Badges'
import { getOrCreateUserId } from '../utils/userId'
import { sendQueryToAssistant } from '../utils/voiceAssistant'
import {
  HeartIcon,
  HeartFilledIcon,
  PinIcon,
  TargetIcon,
  MicIcon,
  EyeIcon,
  EyeOffIcon,
  DoneIcon,
} from './Icons'

interface FlashCardProps {
  card: Case
  onFlip: () => void
  flipped: boolean
  isFavorited: boolean
  onFavorite: () => void
}

export function FlashCard({
  card,
  onFlip,
  flipped,
  isFavorited,
  onFavorite,
}: FlashCardProps) {
  const [assistantResult, setAssistantResult] = useState<{copied: boolean; device: string} | null>(null)
  const assistantTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleSendToAssistant = (e: React.MouseEvent) => {
    e.stopPropagation()
    sendQueryToAssistant(card.query).then((result) => {
      setAssistantResult(result)
      clearTimeout(assistantTimer.current)
      assistantTimer.current = setTimeout(() => setAssistantResult(null), 3000)
    })
  }

  const dismissOverlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    setAssistantResult(null)
    clearTimeout(assistantTimer.current)
  }

  const overlayContent = () => {
    if (!assistantResult) return null
    const { device } = assistantResult
    const closeBtn = (
      <button className="ov-close" onClick={dismissOverlay}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    )
    if (device === 'huawei') {
      return (<>
        <div className="ov-title">已复制问题到剪贴板</div>
        <b>唤起小艺的方式：</b><br />• 说「小艺小艺」<br />• 或长按电源键 1 秒<br />唤醒后直接说出或粘贴问题即可
        {closeBtn}
      </>)
    }
    if (device === 'android') {
      return (<>
        <div className="ov-title">已复制问题到剪贴板</div>
        请唤起你的语音助手（长按 Home 键或侧边键），然后粘贴提问
        {closeBtn}
      </>)
    }
    return (<>
      <div className="ov-title">已复制问题到剪贴板</div>
      请唤起语音助手（长按 Home 键说「Hey Siri」），然后粘贴提问
      {closeBtn}
    </>)
  }

  return (
    <div className="card-main" onClick={onFlip}>
      <div className="card-header">
        <span className="card-id">{card.id}</span>
        <LevelBadge level={card.level} />
        <SheetBadge sheet={card.sheet} />
        {card.userAdded && (
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            自添加
          </span>
        )}
        <button className={`fav-btn ${isFavorited ? 'on' : ''}`} onClick={e => { e.stopPropagation(); onFavorite(); }}>
          {isFavorited ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
        </button>
      </div>

      {!flipped ? (
        <div className="card-body">
          <div className="card-query">{card.query}</div>
          {card.imageData && <img src={card.imageData} className="card-img" alt="附图" />}
          <div className="card-query-actions">
            <button className="assistant-btn-inline" onClick={handleSendToAssistant}>
              <MicIcon size={15} /> 发到语音助手
            </button>
          </div>
          <p className="card-hint">点击翻看答案</p>
        </div>
      ) : (
        <div className="card-body" style={{ overflowY: 'auto' }}>
          <div className="card-answer-section">
            <div className="card-answer-label">预设数据</div>
            <div className="card-answer-text" style={{ fontSize: 12 }}>{card.preset}</div>
          </div>
          <div className="card-answer-section">
            <div className="card-answer-label">Golden Answer</div>
            <div className="card-answer-text">{card.golden}</div>
          </div>
          {card.imageData && (
            <div className="card-answer-section">
              <div className="card-answer-label">附图</div>
              <img src={card.imageData} className="card-img" alt="附图" style={{ marginTop: 4 }} />
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <span className="footer-meta"><PinIcon size={11} />{card.source}</span>
        <span className="footer-meta footer-skill"><TargetIcon size={11} />{card.skill}</span>
      </div>

      {assistantResult && (
        <div className="assistant-overlay" onClick={e => e.stopPropagation()}>{overlayContent()}</div>
      )}
    </div>
  )
}

interface CardsViewProps {
  cases: Case[]
  onShuffle?: () => void
}

export function CardsView({ cases, onShuffle }: CardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)
  const [animating, setAnimating] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const userId = getOrCreateUserId()

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

  const card = cases[currentIndex]
  const total = cases.length
  const done = currentIndex

  const goNext = () => {
    if (animating || currentIndex >= total - 1) return
    setAnimDir('left')
    setAnimating(true)
    setTimeout(() => {
      setCurrentIndex(i => i + 1)
      setFlipped(false)
      setAnimDir(null)
      setAnimating(false)
    }, 150)
  }

  const goPrev = () => {
    if (animating || currentIndex <= 0) return
    setAnimDir('right')
    setAnimating(true)
    setTimeout(() => {
      setCurrentIndex(i => i - 1)
      setFlipped(false)
      setAnimDir(null)
      setAnimating(false)
    }, 150)
  }

  const reset = () => {
    setCurrentIndex(0)
    setFlipped(false)
  }

  const cardStyle: React.CSSProperties = {
    animation: animDir ? `cardSlide${animDir === 'left' ? 'Out' : 'In'} .15s ease-out` : undefined,
  }

  // 当 shuffle 获取新数据时重置到第一张
  // cases 引用变化时自动重置
  // 但需要避免在初次渲染时重置
  // 直接用 currentIndex 的变化来响应 cases 长度变化
  // 如果 cases 变了且 currentIndex 超出，重置
  if (cases.length > 0 && currentIndex >= cases.length) {
    // 会在下一次渲染修正，但为了不破坏 hooks 规则，用 setTimeout
    setTimeout(() => setCurrentIndex(0), 0)
  }

  return (
    <div className="card-area">
      <div className="deck-bar">
        <div className="deck-info">
          {done} / {total} 已查看
        </div>
        <button className="shuffle-btn" onClick={() => onShuffle?.()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          换一批
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <div className="card-viewport" style={cardStyle}>
        {card ? (
          <FlashCard
            key={currentIndex}
            card={card}
            onFlip={() => setFlipped(f => !f)}
            flipped={flipped}
            isFavorited={favoriteIds.has(card.id)}
            onFavorite={() => toggleFavorite(card.id)}
          />
        ) : (
          <div className="done-card">
            <DoneIcon size={44} />
            <div className="done-title">没有更多用例</div>
            <button className="reset-btn" onClick={reset} style={{ marginTop: 8 }}>
              换一批试试
            </button>
          </div>
        )}
      </div>

      <div className="nav-row">
        <button className="nav-row-btn" onClick={goPrev} disabled={currentIndex <= 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          上一张
        </button>

        <div className="nav-row-center">
          <button className="nav-row-icon" onClick={() => setFlipped(f => !f)} title="翻面">
            {flipped ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
          <span className="nav-row-count">{currentIndex + 1}/{total}</span>
        </div>

        <button className="nav-row-btn" onClick={goNext} disabled={currentIndex >= total - 1}>
          下一张
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {card && (
        <div className="card-note">备注：{card.note}</div>
      )}
    </div>
  )
}
