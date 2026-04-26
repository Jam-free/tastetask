# API 文档

## 通用约定

- Base URL: `/api`
- Content-Type: `application/json`（除文件上传）
- 用户身份 header: `X-User-Id: <uuid>`（前端首次访问时生成并存 localStorage）
- 管理员鉴权 header: `Authorization: Bearer <jwt>`
- 错误格式：`{ "error": "message", "code": "ERROR_CODE" }`

## 用例（Cases）

### `GET /api/cases`

返回全部未删除用例。

**Query params**:
- `level` (可选): `L1|L2|L3|L4|L5`
- `sheet` (可选): 数据源大类
- `sortBy` (可选): `id`（默认） | `favorites`

**Response**:
```json
[
  {
    "id": "XY-01",
    "query": "我家的地址在哪里？",
    "level": "L1",
    "sheet": "对话记忆",
    "source": "对话记忆",
    "preset": "...",
    "golden": "...",
    "skill": "...",
    "note": "...",
    "imageUrl": null,
    "isPreset": true,
    "favoriteCount": 3,
    "iFavorited": false,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### `POST /api/cases`

提交新用例。需要 `X-User-Id`。

**Body**:
```json
{
  "query": "...",
  "level": "L2",
  "sheet": "对话记忆",
  "source": "对话记忆",
  "preset": "...",
  "golden": "...",
  "skill": "",
  "note": "",
  "imageUrl": null
}
```

**Response**: `201 Created` + 新用例对象

**校验**:
- `query`、`golden` 非空
- `level` 必须是 L1–L5
- `sheet` 必须在预定义列表中
- 速率限制：单 IP 每分钟 10 次

### `DELETE /api/cases/:id`

软删除用例。需要管理员 JWT。

**Response**: `204 No Content`

## 收藏（Favorites）

### `POST /api/cases/:id/favorite`

收藏。需要 `X-User-Id`。幂等。

**Response**: `{ "favoriteCount": 4, "iFavorited": true }`

### `DELETE /api/cases/:id/favorite`

取消收藏。

**Response**: `{ "favoriteCount": 3, "iFavorited": false }`

### `GET /api/leaderboard`

收藏排行榜 Top 20。

**Response**:
```json
[
  { "id": "XY-11", "query": "...", "favoriteCount": 12 },
  ...
]
```

## 文件上传

### `POST /api/upload`

**Content-Type**: `multipart/form-data`

**Form field**: `file` (单文件)

**限制**:
- 大小 ≤ 5MB
- 类型 JPG / PNG / WEBP
- 校验 magic number，不只看 mimetype

**Response**:
```json
{ "imageUrl": "/uploads/abc123.png" }
```

## 管理员

### `POST /api/admin/login`

**Body**: `{ "password": "..." }`

**Response (成功)**:
```json
{ "token": "eyJhbGc...", "expiresAt": "2025-01-02T00:00:00Z" }
```

**Response (失败)**: `401` + 加 1 秒延迟（防爆破）

速率限制：单 IP 每 5 分钟最多 5 次。

### `GET /api/admin/me`

校验 JWT 是否有效。

**Response**: `{ "isAdmin": true }` 或 `401`

## 健康检查

### `GET /api/health`

**Response**: `{ "status": "ok", "version": "2.0.0" }`
