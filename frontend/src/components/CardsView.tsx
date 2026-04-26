import { useState, useRef, useCallback, useEffect } from 'react'
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
  UndoIcon,
  EyeIcon,
  EyeOffIcon,
  NextIcon,
  DoneIcon,
} from './Icons'

interface FlashCardProps {
  card: Case
  dragX: number
  isDragging: boolean
  onFlip: () => void
  flipped: boolean
  isFavorited: boolean
  onFavorite: () => void
}

export function FlashCard({
  card,
  dragX,
  isDragging,
  onFlip,
  flipped,
  isFavorited,
  onFavorite,
}: FlashCardProps) {
  const rot = dragX * 0.05
  const leftOpacity = Math.min(1, Math.max(0, (-dragX - 30) / 80))
  const rightOpacity = Math.min(1, Math.max(0, (dragX - 30) / 80))
  const pastThreshold = Math.abs(dragX) > 60
  const scale = 1 - Math.min(Math.abs(dragX) / 600, 0.08)

  const style: React.CSSProperties = {
    transform: `translateX(${dragX}px) rotate(${rot}deg) scale(${scale})`,
    transition: isDragging ? 'none' : 'transform .3s cubic-bezier(.34,1.56,.64,1)',
    boxShadow:
      Math.abs(dragX) > 20
        ? `0 10px 36px rgba(0,0,0,.18)`
        : '0 2px 16px rgba(0,0,0,.08)',
    borderColor: pastThreshold
      ? dragX < 0
        ? 'rgba(239,68,68,.5)'
        : 'rgba(34,197,94,.5)'
      : undefined,
  }

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
    if (device === 'huawei') {
      return (
        <>
          <div className="ov-title">已复制问题到剪贴板</div>
          <b>唤起小艺的方式：</b><br />
          • 说「小艺小艺」<br />
          • 或长按电源键 1 秒<br />
          唤醒后直接说出或粘贴问题即可
          <button className="ov-close" onClick={dismissOverlay}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </>
      )
    }
    if (device === 'android') {
      return (
        <>
          <div className="ov-title">已复制问题到剪贴板</div>
          请唤起你的语音助手（长按 Home 键或侧边键），然后粘贴提问
          <button className="ov-close" onClick={dismissOverlay}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </>
      )
    }
    return (
      <>
        <div className="ov-title">已复制问题到剪贴板</div>
        请唤起语音助手（长按 Home 键说「Hey Siri」），然后粘贴提问
        <button className="ov-close" onClick={dismissOverlay}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </>
    )
  }

  return (
    <div
      className="card-main"
      style={style}
      onClick={onFlip}
    >
      <div
        className="swipe-indicator swipe-left-ind"
        style={{ opacity: leftOpacity }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <div
        className="swipe-indicator swipe-right-ind"
        style={{ opacity: rightOpacity }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </div>

      {/* 滑过阈值时的提醒 */}
      {pastThreshold && (
        <div className="swipe-hint">
          {dragX < 0 ? '跳过' : '标记'}
        </div>
      )}

      <div className="card-header">
        <span className="card-id">{card.id}</span>
        <LevelBadge level={card.level} />
        <SheetBadge sheet={card.sheet} />
        {card.userAdded && (
          <span
            className="badge"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
            }}
          >
            自添加
          </span>
        )}
        <button
          className={`fav-btn ${isFavorited ? 'on' : ''}`}
          onClick={e => { e.stopPropagation(); onFavorite(); }}
        >
          {isFavorited ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
        </button>
      </div>

      {!flipped ? (
        <div className="card-body">
          <div className="card-query">{card.query}</div>
          {card.imageData && (
            <img src={card.imageData} className="card-img" alt="附图" />
          )}
          <div className="card-query-actions">
            <button className="assistant-btn-inline" onClick={handleSendToAssistant}>
              <MicIcon size={15} />
              发到语音助手
            </button>
          </div>
          <p className="card-hint">点击查看答案 · 左右拖动滑过</p>
        </div>
      ) : (
        <div className="card-body" style={{ overflowY: 'auto' }}>
          <div className="card-answer-section">
            <div className="card-answer-label">预设数据</div>
            <div
              className="card-answer-text"
              style={{ fontSize: 12 }}
            >
              {card.preset}
            </div>
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
        <span className="footer-meta">
          <PinIcon size={11} />
          {card.source}
        </span>
        <span className="footer-meta footer-skill">
          <TargetIcon size={11} />
          {card.skill}
        </span>
      </div>

      {assistantResult && (
        <div className="assistant-overlay" onClick={e => e.stopPropagation()}>
          {overlayContent()}
        </div>
      )}
    </div>
  )
}

interface CardsViewProps {
  cases: Case[]
  onShuffle?: () => void
}

export function CardsView({ cases, onShuffle }: CardsViewProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [flipped, setFlipped] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const startX = useRef(0)
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
    } catch (err) {
      console.error('收藏操作失败:', err)
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFav) next.add(caseId)
        else next.delete(caseId)
        return next
      })
    }
  }, [favoriteIds, userId])

  const active = cases.filter((c) => !dismissed.has(c.id))
  const card = active[0]

  const dismiss = useCallback(() => {
    if (!card) return
    setDismissed((d) => new Set([...d, card.id]))
    setFlipped(false)
    setDragX(0)
  }, [card])

  const undo = useCallback(() => {
    const arr = Array.from(dismissed)
    if (!arr.length) return
    const last = arr[arr.length - 1]
    setDismissed((d) => {
      const nd = new Set(d)
      nd.delete(last)
      return nd
    })
    setFlipped(false)
  }, [dismissed])

  const reset = () => {
    setDismissed(new Set())
    setFlipped(false)
    setDragX(0)
  }

  useEffect(() => {
    setFlipped(false)
  }, [card?.id])

  // 鼠标/触摸事件处理
  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX
    setIsDragging(true)
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const x =
      ('touches' in e ? e.touches[0].clientX : e.clientX) - startX.current
    setDragX(x)
  }

  const onUp = () => {
    setIsDragging(false)
    const threshold = 60
    if (Math.abs(dragX) > threshold) {
      dismiss()
    } else {
      setDragX(0)
    }
  }

  const total = cases.length
  const done = dismissed.size
  const pct = total ? done / total : 0

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
        <div
          className="progress-fill"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <div
        className="card-stack"
        onMouseDown={onDown}
        onMouseMove={isDragging ? onMove : undefined}
        onMouseUp={onUp}
        onMouseLeave={isDragging ? onUp : undefined}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        {active.length > 2 && <div className="card-behind card-behind-2" />}
        {active.length > 1 && <div className="card-behind card-behind-1" />}

        {card ? (
          <FlashCard
            key={card.id}
            card={card}
            dragX={dragX}
            isDragging={isDragging}
            onFlip={() => setFlipped((f) => !f)}
            flipped={flipped}
            isFavorited={favoriteIds.has(card.id)}
            onFavorite={() => toggleFavorite(card.id)}
          />
        ) : (
          <div className="done-card">
            <DoneIcon size={44} />
            <div className="done-title">全部 {total} 条看完了</div>
            <div className="done-sub">今日练习完成</div>
            <button className="reset-btn" onClick={reset} style={{ marginTop: 8 }}>
              重新开始
            </button>
          </div>
        )}
      </div>

      <div className="controls">
        <button className="ctrl-btn" onClick={undo} title="撤回">
          <UndoIcon size={18} />
        </button>
        <button
          className="ctrl-btn primary"
          onClick={() => setFlipped((f) => !f)}
          title="翻面"
        >
          {flipped ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
        <button className="ctrl-btn" onClick={dismiss} title="下一张">
          <NextIcon size={20} />
        </button>
      </div>

      {card && (
        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            maxWidth: 520,
            lineHeight: 1.7,
          }}
        >
          备注：{card.note}
        </div>
      )}
    </div>
  )
}
