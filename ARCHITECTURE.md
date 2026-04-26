# 架构设计

## 总览

```
┌─────────────────────────────────────────────────────────────┐
│                     浏览器 (React SPA)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ FlashCard│  │TableView │  │ AddView  │  │ AdminBar │     │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│        └────────────┴──────┬──────┴─────────────┘            │
│                       api/client.ts                          │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTPS / JSON
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Node.js + Express 后端                      │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐     │
│  │ /cases  │  │/favorites│  │ /upload │  │ /admin     │     │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └──────┬─────┘     │
│       │            │             │              │            │
│  ┌────▼────────────▼─────────────▼──────────────▼─────┐     │
│  │   middleware: auth(JWT) · rateLimit · validate    │     │
│  └────────────────────────┬───────────────────────────┘     │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────┐     │
│  │              Prisma ORM (Type-safe)                │     │
│  └────────────────────────┬───────────────────────────┘     │
└───────────────────────────┼──────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
       ┌────────────┐              ┌────────────────┐
       │  SQLite    │              │  uploads/      │
       │  / Postgres│              │  *.png *.jpg   │
       └────────────┘              └────────────────┘
```

## 核心数据流

### 闪卡练习
1. 前端 `GET /api/cases` 拿全部用例（含 `favoriteCount` 和 `iFavorited`）
2. 前端本地随机抽 30 张
3. 用户点击 ♡ → `POST /api/cases/:id/favorite`，乐观更新 UI

### 添加用例
1. 用户填表，可选上传图片
2. 图片先 `POST /api/upload` → 拿到 `imageUrl`
3. 表单提交 `POST /api/cases`，body 含 `imageUrl`
4. 后端校验、写库、返回新用例

### 管理员删除
1. 用户点击「🔒」→ 输密码 → `POST /api/admin/login` 拿 JWT
2. JWT 存 sessionStorage，请求头 `Authorization: Bearer xxx`
3. 删除时 `DELETE /api/cases/:id`，后端校验 JWT 后软删除

## 数据库 Schema（Prisma）

```prisma
model Case {
  id          String    @id // "XY-01" 或 "USR-{cuid}"
  query       String
  level       String    // L1 | L2 | L3 | L4 | L5
  sheet       String    // 数据源大类（中文枚举）
  source      String
  preset      String    @db.Text
  golden      String    @db.Text
  skill       String
  note        String
  imageUrl    String?
  isPreset    Boolean   @default(false)
  createdBy   String?   // 浏览器指纹或用户 ID
  createdAt   DateTime  @default(now())
  deletedAt   DateTime? // 软删除

  favorites   Favorite[]

  @@index([deletedAt])
  @@index([level])
  @@index([sheet])
}

model Favorite {
  caseId    String
  userId    String   // 浏览器指纹
  createdAt DateTime @default(now())

  case      Case @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@id([caseId, userId])
  @@index([userId])
}
```

## 用户身份策略（无注册）

为了简化，不做账号系统。用户身份用：

```typescript
// frontend/src/lib/userId.ts
function getUserId(): string {
  let id = localStorage.getItem('tt_user_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('tt_user_id', id);
  }
  return id;
}
```

每次请求带上 `X-User-Id` header。后端用这个去重收藏。

> 局限：清缓存就丢身份。但对内部工具够用。后期想做账号体系，再补。

## 鉴权策略

### 普通用户
- 无需登录
- 写操作（提交、收藏）只验证 `X-User-Id`，不校验身份真伪
- 速率限制按 IP

### 管理员
- 密码存后端 `.env`，bcrypt 哈希
- 登录后发 JWT（24 小时过期）
- 所有 `DELETE` 操作必须带有效 JWT

```typescript
// backend/.env
ADMIN_PASSWORD_HASH=$2b$10$xxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=随机32位字符串
```

## 文件上传

```typescript
// 用 multer
import multer from 'multer';
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid type'), ok);
  }
});
```

文件名用 `{uuid}.{ext}`，避免冲突和路径攻击。

## 性能考虑

- 用例总数预计 < 1000，全量返回即可，无需分页
- 收藏数用 SQL `COUNT` 实时算（用例少时无压力），后期可加 `Case.favoriteCount` 冗余字段
- 静态资源用 Nginx 缓存

## 与 v1 的差异

| 项 | v1 (HTML) | v2 (前后端) |
|---|---|---|
| 数据存储 | localStorage | SQLite/Postgres |
| 数据共享 | 单设备 | 多人共享 |
| 图片 | Base64 内嵌 | URL + 文件存储 |
| 管理员密码 | 前端硬编码 ⚠️ | 后端 bcrypt ✓ |
| 收藏数 | 个人 | 全局聚合 |
| 部署 | 双击打开 | Docker / 服务器 |
