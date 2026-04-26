# 给 Claude Code 的交接 Prompt

把下面这段话整段复制到 Claude Code（搭配 GLM 使用），作为第一条消息发给它。它包含完整的项目背景、架构决策、和分阶段任务。

---

## 复制以下内容 ↓

我有一个叫 Taste-Task 试金石 的项目，目前是一个单页 HTML 的 v1 版本，已经完成了 UI 和交互。我需要你把它升级成一个可部署的前后端分离项目，让团队多人共享数据。

请先 **读完整个项目**：
1. `README.md` — 项目概览和当前状态
2. `docs/ARCHITECTURE.md` — 目标架构和数据库设计
3. `docs/API.md` — 完整 API 设计
4. `docs/TODO.md` — 分阶段任务清单
5. `index.html` — v1 实现（保留为参考，包含全部 UI 逻辑、CSS 变量、29 条预置用例数据）
6. `docs/AI记忆能力黄金测试集_v1.0.xlsx` — 完整测试集 Excel（如需要扩充预置数据可读它）

读完后跟我确认你理解了：
- 这是一个内部团队工具，做 AI 记忆能力的黄金测试集管理
- 核心交互是 Tinder 风格的闪卡抽查 + 团队协作收集 + 收藏排序
- v1 用 localStorage，v2 要换成 SQLite + Express 后端
- 管理员密码 `shijinshi1994`，但必须存 bcrypt 哈希到后端 `.env`，不能留在前端
- 所有 v1 的 UI 行为（滑动、翻面、附图、收藏、暗色模式、L1-L5 等级说明、随机 30 张换一批）必须保留

确认理解后，按 `docs/TODO.md` 的 Phase 1 顺序执行，但每完成一个里程碑停下来让我 review，**不要一口气全做完**：

**里程碑 1：项目骨架**
- 创建 `frontend/`（Vite + React + TS）和 `backend/`（Express + TS + Prisma）两个目录
- 配好 TypeScript、ESLint、基本的 npm scripts
- 后端能起来 `GET /api/health` 返回 `{status:"ok"}`
- 前端能起来显示一个空页面，能调通 health 接口

**里程碑 2：数据层**
- Prisma schema 写好（按 ARCHITECTURE.md 的设计）
- seed 脚本：把 `index.html` 里的 `PRESET` 数组（29 条用例）写入数据库
- 写完整的 `/api/cases` 的 GET 和 POST，含校验
- 用 curl / Postman 跑通

**里程碑 3：迁移前端 UI**
- 把 `index.html` 拆到 `frontend/src/` 下，按 components / hooks / api / types 组织
- 保留所有现有 CSS（CSS 变量、暗色模式、动画）
- 把所有 localStorage 调用改成 API 调用
- 用户身份用 `crypto.randomUUID()` 存 localStorage，每次请求带 `X-User-Id` header
- 此时收藏、添加用例都走后端

**里程碑 4：管理员 + 收藏统计**
- bcrypt 处理密码，存 `.env`
- `/api/admin/login` 返回 JWT
- 删除接口加 JWT 校验
- `/api/cases` 返回每条的全局 `favoriteCount` 和当前用户的 `iFavorited`
- 表格按收藏排序时按全局收藏数排（不是「我是否收藏」）

**里程碑 5：安全 & 部署准备**
- 速率限制（express-rate-limit）
- 文件上传校验（magic number、大小、类型）
- 写 Dockerfile 和 docker-compose.yml
- 写 `docs/DEPLOY.md`

---

## 工程偏好

- 用 TypeScript，不用 JavaScript
- 后端用 Prisma 而不是手写 SQL
- 前端用 fetch + 自己封装的 api client，**不要**引 axios / react-query（团队偏好简洁）
- CSS 沿用 v1 的 CSS 变量方案，**不要**引 Tailwind 或 styled-components
- React 用函数组件 + hooks，不用 class
- 错误处理用 try/catch + toast 提示，不要把异常吞掉
- 提交粒度细一点，每个里程碑分多次 commit，commit message 写清楚

## 文件结构请遵照 `README.md` 中的「目录结构」段落

## 不确定的事提问

如果对某个设计决策有疑问（比如「要不要加用户系统」「图片要不要上 OSS」），先问我，**不要自作主张**。我希望保持架构简洁，能不加的依赖就不加。

完成里程碑 1 后，跟我说「里程碑 1 完成，请 review」，我会跑起来看效果再告诉你继续。

---

## 复制到此结束 ↑

**额外 tips**：
- 如果 GLM 上下文不够长，可以把这个 prompt 拆成两段发：先发「读项目」部分，等它读完确认后再发「里程碑」部分。
- 进入里程碑 3 前可以让它先把 `index.html` 中的 `PRESET` 数组单独提取成 JSON 文件，方便 seed 脚本读。
- 里程碑 4 完成后建议手动测试管理员登录、错误密码、JWT 过期三个 case。
