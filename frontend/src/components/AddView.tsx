import { useState, useRef, ChangeEvent } from 'react'
import { Case, CaseLevel, CaseSheet, SHEET_OPTIONS } from '../types'

interface AddViewProps {
  onAdd: (newCase: Partial<Case>) => void
}

export function AddView({ onAdd }: AddViewProps) {
  const [form, setForm] = useState<{
    query: string
    level: CaseLevel
    sheet: CaseSheet
    source: string
    preset: string
    golden: string
    skill: string
    note: string
  }>({
    query: '',
    level: 'L1',
    sheet: '对话记忆',
    source: '',
    preset: '',
    golden: '',
    skill: '',
    note: '',
  })

  const [img, setImg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof typeof form>(
    key: K,
    value: typeof form[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 限制文件大小
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    // 限制文件类型
    if (!file.type.startsWith('image/')) {
      alert('只支持图片文件')
      return
    }

    // 直接转换为 base64
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImg(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    if (!form.query.trim()) {
      alert('请填写查询 Query')
      return
    }
    if (!form.golden.trim()) {
      alert('请填写期望输出')
      return
    }

    onAdd({
      ...form,
      id: `USR-${Date.now()}`,
      userAdded: true,
      imageData: img || null,
      favoriteCount: 0,
      isFavorited: false,
    } as any)

    // 重置表单
    setForm({
      query: '',
      level: 'L1',
      sheet: '对话记忆',
      source: '',
      preset: '',
      golden: '',
      skill: '',
      note: '',
    })
    setImg(null)
  }

  return (
    <div className="add-wrap">
      <div className="add-section-title">添加新用例</div>

      <div className="add-form">
        <div className="form-group">
          <label className="form-label">
            查询 Query <span className="req">*</span>
          </label>
          <input
            className="form-input"
            value={form.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder="用户实际的说话内容，尽量口语化"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">查询等级</label>
            <select
              className="form-select"
              value={form.level}
              onChange={(e) => set('level', e.target.value as CaseLevel)}
            >
              <option value="L1">L1 - 直接召回</option>
              <option value="L2">L2 - 简单关联</option>
              <option value="L3">L3 - 复杂推理</option>
              <option value="L4">L4 - 高级聚合</option>
              <option value="L5">L5 - 综合计算</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">所属数据源</label>
            <select
              className="form-select"
              value={form.sheet}
              onChange={(e) => set('sheet', e.target.value as CaseSheet)}
            >
              {SHEET_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            具体来源（如：12306短信、系统日历等）
          </label>
          <input
            className="form-input"
            value={form.source}
            onChange={(e) => set('source', e.target.value)}
            placeholder="例：系统日历、备忘录"
          />
        </div>

        <div className="form-group">
          <label className="form-label">预设数据内容</label>
          <textarea
            className="form-textarea"
            value={form.preset}
            onChange={(e) => set('preset', e.target.value)}
            placeholder="触发这条 query 所需系统中预先存在的数据"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            期望输出 Golden Answer <span className="req">*</span>
          </label>
          <textarea
            className="form-textarea"
            value={form.golden}
            onChange={(e) => set('golden', e.target.value)}
            placeholder="AI 应该给出的标准回答或关键要素"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">考察能力点</label>
            <input
              className="form-input"
              value={form.skill}
              onChange={(e) => set('skill', e.target.value)}
              placeholder="例：模糊匹配 + 字段提取"
            />
          </div>

          <div className="form-group">
            <label className="form-label">难点 / 备注</label>
            <input
              className="form-input"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="易失败点说明"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">截图 / 附图（可选）</label>
          <div
            className="upload-zone"
            onClick={() => fileRef.current?.click()}
          >
            {img ? (
              <img src={img} className="card-img-prev" alt="preview" />
            ) : (
              <>
                <div className="up-icon">📎</div>
                <p>点击上传截图、失败案例图片</p>
                <p className="sub">支持 JPG · PNG · WEBP，最大 5MB</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          {img && (
            <button
              className="expand-btn"
              style={{ marginTop: 8 }}
              onClick={() => setImg(null)}
            >
              移除图片
            </button>
          )}
        </div>

        <button className="submit-btn" onClick={submit}>
          添加用例
        </button>
      </div>
    </div>
  )
}
