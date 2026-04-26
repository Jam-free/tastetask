# TODO

按优先级和阶段排序。

## Phase 1 · 工程化基础（必做）

- [ ] **拆分 v1 单页 HTML 到 React + Vite + TypeScript 项目**
  - 当前 `index.html` 是一个 1000+ 行的 React UMD 页面，作为参考实现
  - 拆分到 `frontend/` 目录，按 `components/hooks/api/types` 组织
  - 保留所有现有 CSS 变量和暗色模式逻辑
  - 保留所有 UI 行为：滑动、翻面、附图展示、收藏、管理员

- [ ] **搭 Express + Prisma 后端骨架**
  - `backend/` 目录，TypeScript
  - Prisma schema 定义 `Case`、`Favorite` 表
  - SQLite 开发，预留 PostgreSQL 配置
  - 启动后自动执行 seed：把 `index.html` 中 `PRESET` 数组的 29 条用例写入数据库

- [ ] **实现核心 API**（详见 `API.md`）
  - `GET /api/cases` — 列表，含每条的 `favoriteCount`
  - `POST /api/cases` — 提交新用例
  - `DELETE /api/cases/:id` — 删除（管理员）
  - `POST /api/cases/:id/favorite` / `DELETE` — 收藏切换
  - `POST /api/upload` — multer 接图片，存 `uploads/`
  - `POST /api/admin/login` — bcrypt 比对密码，返回 JWT

- [ ] **前端接入 API**
  - 把 v1 中所有 `localStorage` 调用替换为 API 调用
  - 用户身份用浏览器指纹（FingerprintJS）或随机 UUID 存 localStorage
  - 管理员 JWT 存 sessionStorage
  - 加 loading 和 error 状态处理

## Phase 2 · 安全 & 鲁棒（部署前必做）

- [ ] 管理员密码改 bcrypt，存 `.env` 文件，不能进 git
- [ ] 写操作加速率限制（`express-rate-limit`）
- [ ] 图片上传校验：大小 ≤ 5MB，类型 JPG/PNG/WEBP，校验文件头
- [ ] 防 XSS：所有用户输入用 React 默认转义即可，但要警惕 `dangerouslySetInnerHTML`
- [ ] CORS 配置：仅允许部署域名
- [ ] 软删除：删除用例只标记 `deletedAt`，不真删

## Phase 3 · 体验优化

- [ ] 收藏排行榜页：单独 Tab，按 `favoriteCount` 倒序，展示 Top 20
- [ ] 用例展示「全局收藏数」，不再只显示「我是否收藏」
- [ ] 卡片闪卡支持键盘操作（← → 空格翻面）
- [ ] 添加用例时支持「批量从 Excel 导入」（解析 xlsx）
- [ ] 测试集总览支持搜索（query 关键字）
- [ ] 用例提交后增加「待审核」状态（可选），管理员审核通过后才可见

## Phase 4 · 部署

- [ ] 写 Dockerfile（前端、后端各一个）
- [ ] 写 `docker-compose.yml`，含 Nginx
- [ ] 写部署文档 `docs/DEPLOY.md`
- [ ] SQLite 自动备份脚本（每日 cron）

## Phase 5 · 锦上添花（可选）

- [ ] 简单的用户系统（手机号 + 验证码登录）
- [ ] 收藏数据导出（CSV）给团队周会用
- [ ] 用例「测试结果」字段（管理员可标记 通过/失败）
- [ ] 失败用例聚合视图：只看被标记为失败的
- [ ] 暗黑主题手动切换（不只跟系统）
- [ ] 移动端 PWA 支持

---

## ⚠️ 当前 v1 已知问题

1. 截图用 Base64 直存 localStorage，多张图会爆容量（5–10MB 限制）
2. 「换一批」时如果用例总数 < 30，会重复抽到全部
3. 管理员退出时 confirm 文案需要英文/中文统一
4. 表格在窄屏下会横向滚动，没做响应式改造

迁移到后端时这些会自然解决。
