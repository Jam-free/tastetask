import { LEVEL_STYLE, CaseLevel } from '../types'

const LEVEL_DESCRIPTIONS: Record<
  CaseLevel,
  { name: string; desc: string; eg: string }
> = {
  L1: {
    name: '直接召回',
    desc: '单条记忆的直接语义召回，无需推理',
    eg: '我老婆生日是哪天？',
  },
  L2: {
    name: '简单关联',
    desc: '需要单跳关联、简单推理或外部数据结合',
    eg: '童童的生日是哪天？（需先识别童童=女儿）',
  },
  L3: {
    name: '复杂推理',
    desc: '多跳推理、模糊匹配、多条记忆聚合',
    eg: '童童是什么星座？（别名→关系→生日→星座）',
  },
  L4: {
    name: '高级聚合',
    desc: '大范围时间筛选、主题归类、跨源对比分析',
    eg: '我最近记过什么重要日期？',
  },
  L5: {
    name: '综合计算',
    desc: '复杂计算、多字段提取输出、长时间范围聚合',
    eg: '帮我统计一下我这周记过的账单',
  },
}

interface LevelModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LevelModal({ isOpen, onClose }: LevelModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">等级说明</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {(Object.keys(LEVEL_DESCRIPTIONS) as CaseLevel[]).map((level) => {
            const info = LEVEL_DESCRIPTIONS[level]
            const style = LEVEL_STYLE[level]
            return (
              <div key={level} className="level-row">
                <div
                  className="lv-badge"
                  style={{
                    background: style.bg,
                    color: style.color,
                  }}
                >
                  {level}
                </div>
                <div className="level-info">
                  <div className="level-name">
                    {level} - {info.name}
                  </div>
                  <div className="level-desc">{info.desc}</div>
                  <div className="level-eg">例：{info.eg}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
