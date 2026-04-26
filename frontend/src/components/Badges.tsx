import { LEVEL_STYLE, SHEET_COLOR, CaseLevel, CaseSheet } from '../types'

interface LevelBadgeProps {
  level: CaseLevel
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const style = LEVEL_STYLE[level] || { bg: '#f0f0f0', color: '#666' }
  return (
    <span
      className="badge"
      style={{
        background: style.bg,
        color: style.color,
      }}
    >
      {level}
    </span>
  )
}

interface SheetBadgeProps {
  sheet: CaseSheet
}

export function SheetBadge({ sheet }: SheetBadgeProps) {
  const color = SHEET_COLOR[sheet] || '#888'
  return (
    <span
      className="badge"
      style={{
        background: `${color}1a`,
        color,
      }}
    >
      {sheet}
    </span>
  )
}
