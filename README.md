# Taste-Task 试金石

AI记忆能力黄金测试集 - 让优秀被看见

## 功能特点

### 1. 闪卡练习模式
- 随机抽取30条用例进行练习
- 支持左右滑动切换、点击翻面查看答案
- 可随时"换一批"获取新的随机用例
- 答案面展示附件图片

### 2. 测试集总览
- 表格形式展示所有用例
- 支持按等级/数据源筛选
- 显示每条用例的收藏次数
- 管理员可删除用户提交的用例

### 3. 收藏功能
- 用户可收藏认为优秀的黄金用例
- 收藏排行榜展示最受欢迎的用例
- 后台统计收藏次数，按热度排序

### 4. 用例管理
- 用户可添加自定义用例
- 支持上传图片附件
- 管理员（密码验证）可删除用例

### 5. 等级说明
- L1：直接召回 - 无需推理，直接提取信息
- L2：模糊单跳 - 需一次推理或模糊匹配
- L3：多跳推理 - 需2-3步连续推理
- L4：聚合归类 - 检索多条记忆并归类
- L5：复杂计算 - 需复杂计算和深度分析

## 数据源覆盖

- 对话记忆
- 本机·日历
- 本机·备忘录
- 本机·短信
- 本机·联系人
- 本机·图库
- 本机·文件
- 多数据源
- 边界负样本

## 部署说明

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产部署

```bash
# 安装依赖
npm install

# 启动生产服务器
npm start

# 或使用 PM2
pm2 start server.js --name tastetask
```

### 环境变量

- `PORT`: 服务器端口（默认：3000）
- `NODE_ENV`: 环境（production/development）

## 管理员功能

管理员密码：`shijinshi1994`

管理员权限：
- 删除用户提交的用例

## 技术栈

- **前端**: React 18 (CDN)
- **后端**: Node.js + Express
- **数据库**: SQLite (better-sqlite3)
- **存储**: 本地文件系统

## API接口

### 获取用例列表
```
GET /api/cases?random=true&limit=30
```

### 获取单个用例
```
GET /api/cases/:id
```

### 添加用例
```
POST /api/cases
```

### 删除用例（管理员）
```
DELETE /api/cases/:id
Body: { password: "shijinshi1994" }
```

### 收藏/取消收藏
```
POST /api/cases/:id/favorite
```

### 收藏排行榜
```
GET /api/cases/top/favorites?limit=10
```

### 统计信息
```
GET /api/stats
```

## License

MIT
