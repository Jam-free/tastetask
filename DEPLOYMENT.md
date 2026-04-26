# 部署指南

## Taste-Task 试金石 v2.0 部署文档

### 架构说明

- **前端**: Vite + React 18 + TypeScript
- **后端**: Express + TypeScript + Prisma ORM
- **数据库**: SQLite (开发) / PostgreSQL (生产)

---

## 部署方案

### 方案 A: Vercel (前端) + Railway (后端)

#### 1. 前端部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在 frontend 目录下部署
cd frontend
vercel
```

**环境变量配置:**
- `VITE_API_URL`: 后端API地址

#### 2. 后端部署到 Railway

1. 访问 [railway.app](https://railway.app/)
2. 新建项目，连接GitHub仓库
3. 配置环境变量：
   - `DATABASE_URL`: PostgreSQL连接字符串
   - `JWT_SECRET`: 随机生成的密钥
   - `ADMIN_PASSWORD_HASH`: bcrypt哈希后的管理员密码
   - `CORS_ORIGIN`: 前端地址
   - `NODE_ENV`: `production`

4. 生成管理员密码哈希：
```bash
node -e "console.log(require('bcrypt').hashSync('你的密码', 10))"
```

---

### 方案 B: Render 全栈部署

#### 前端部署

1. 在 `frontend/` 目录创建 `render.yaml`:
```yaml
services:
  - type: web
    name: tastetask-frontend
    env: static
    buildCommand: npm run build
    publishDir: dist
    envVars:
      - key: VITE_API_URL
        value: https://tastetask-backend.onrender.com
```

#### 后端部署

1. 在 `backend/` 目录创建 `render.yaml`:
```yaml
services:
  - type: web
    name: tastetask-backend
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: tastetask-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: ADMIN_PASSWORD_HASH
        value: "你的bcrypt哈希"
      - key: CORS_ORIGIN
        value: https://tastetask-frontend.onrender.com
      - key: NODE_ENV
        value: production
```

---

### 方案 C: 自托管 (VPS)

1. 安装依赖：
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

2. 克隆仓库并安装：
```bash
git clone https://github.com/Jam-free/tastetask.git
cd tastetask

# 安装后端依赖
cd backend
npm install
npm run build

# 生成 Prisma 客户端
npx prisma generate
npx prisma db push
npm run prisma:seed
```

3. 配置环境变量 (.env):
```env
PORT=3001
DATABASE_URL="file:./tastetask.db"
JWT_SECRET=随机生成
ADMIN_PASSWORD_HASH=bcrypt哈希
CORS_ORIGIN=前端地址
NODE_ENV=production
```

4. 启动服务：
```bash
# 后端
pm2 start dist/server.js --name tastetask-backend

# 前端
cd ../frontend
npm install
npm run build

# 使用 nginx 或 caddy 托管静态文件
```

---

## 环境变量检查清单

### 后端必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `PORT` | 服务端口 | `3001` |
| `DATABASE_URL` | 数据库连接 | `file:../tastetask.db` 或 PostgreSQL URL |
| `JWT_SECRET` | JWT签名密钥 | 随机字符串 |
| `ADMIN_PASSWORD_HASH` | 管理员密码bcrypt哈希 | `$2b$10$...` |
| `CORS_ORIGIN` | 允许的前端地址 | `http://localhost:3000` |
| `NODE_ENV` | 运行环境 | `production` |

### 前端可选变量

| 变量名 | 说明 |
|--------|------|
| `VITE_API_URL` | 后端API地址（开发时由proxy处理） |

---

## 数据库迁移

### SQLite → PostgreSQL

1. 导出SQLite数据：
```bash
cd backend
npx prisma db pull
```

2. 更新 `.env` 中的 `DATABASE_URL` 为PostgreSQL地址

3. 推送到PostgreSQL：
```bash
npx prisma db push
npm run prisma:seed
```

---

## 健康检查

部署后验证以下端点：

- `GET /api/health` - 服务器状态
- `GET /api/cases/stats` - 统计信息
- `POST /api/auth/login` - 管理员登录

---

## 常见问题

### Q: CORS 错误
A: 检查后端 `CORS_ORIGIN` 环境变量是否包含前端地址

### Q: 上传图片失败
A: 检查请求体大小限制，Express默认限制为100kb

### Q: 数据库连接失败
A: 确认 `DATABASE_URL` 格式正确，SQLite使用相对路径

### Q: 管理员登录失败
A: 确认 `ADMIN_PASSWORD_HASH` 使用 bcrypt 加密（10轮）
