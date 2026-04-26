import { useState, useRef, ChangeEvent } from 'react'
import { Case, CaseLevel, CaseSheet, SHEET_OPTIONS } from '../types'

interface AddSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (newCase: Partial<Case>) => void
}

export function AddSheet({ isOpen, onClose, onSubmit }: AddSheetProps) {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<CaseLevel>('L1')
  const [sheet, setSheet] = useState<CaseSheet>('对话记忆')
  const [source, setSource] = useState('')
  const [preset, setPreset] = useState('')
  const [golden, setGolden] = useState('')
  const [img, setImg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('图片不能超过 5MB'); return }
    if (!file.type.startsWith('image/')) { alert('只支持图片文件'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setImg(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!query.trim()) { alert('请填写查询 Query'); return }
    if (!golden.trim()) { alert('请填写预期回答'); return }
    onSubmit({
      id: `USR-${Date.now()}`,
      query: query.trim(),
      level,
      sheet,
      source: source.trim(),
      preset: preset.trim(),
      golden: golden.trim(),
      imageData: img,
      userAdded: true,
      favoriteCount: 0,
      isFavorited: false,
    } as any)
    // Reset
    setQuery(''); setLevel('L1'); setSheet('对话记忆')
    setSource(''); setPreset(''); setGolden(''); setImg(null)
  }

  if (!isOpen) return null

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <button className="sheet-cancel" onClick={onClose}>取消</button>
          <span className="sheet-title">添加测试用例</span>
          <button className="sheet-done" onClick={handleSubmit}>添加</button>
        </div>

        <div className="sheet-body">
          <div className="field">
            <label className="field-label">查询 Query</label>
            <input className="field-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="用户实际的说话内容" autoFocus />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">等级</label>
              <select className="field-select" value={level} onChange={(e) => setLevel(e.target.value as CaseLevel)}>
                <option value="L1">L1 直接召回</option>
                <option value="L2">L2 简单关联</option>
                <option value="L3">L3 复杂推理</option>
                <option value="L4">L4 高级聚合</option>
                <option value="L5">L5 综合计算</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">数据源</label>
              <select className="field-select" value={sheet} onChange={(e) => setSheet(e.target.value as CaseSheet)}>
                {SHEET_OPTIONS.map((s) => (<option key={s}>{s}</option>))}
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">具体来源</label>
            <input className="field-input" value={source} onChange={(e) => setSource(e.target.value)} placeholder="例：系统日历、12306短信" />
          </div>

          <div className="field">
            <label className="field-label">预设数据</label>
            <textarea className="field-textarea" value={preset} onChange={(e) => setPreset(e.target.value)} placeholder="触发这条 query 所需预先存在的数据" rows={3} />
          </div>

          <div className="field">
            <label className="field-label">预期回答</label>
            <textarea className="field-textarea" value={golden} onChange={(e) => setGolden(e.target.value)} placeholder="AI 应该给出的标准回答" rows={3} />
          </div>

          <div className="field">
            <label className="field-label">附图（可选）</label>
            <div className="field-upload" onClick={() => fileRef.current?.click()}>
              {img ? (
                <img src={img} className="field-preview" alt="" />
              ) : (
                <span className="field-upload-text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  点击上传截图
                </span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            {img && <button className="field-remove" onClick={() => setImg(null)}>移除</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
