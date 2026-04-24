# Taste-Task 试金石 功能说明

## 项目简介

**Taste-Task 试金石** 是一个AI记忆能力黄金测试集平台，用于系统性地评估AI在个人信息记忆、多跳推理、跨数据源关联等方面的能力表现。

## 实现的功能

### ✅ 1. 闪卡练习优化

**需求**：闪卡查看答案时，附件图片一起展示

**实现**：
- 在答案面（背面）添加了图片展示区域
- 如果用例有图片附件，会同时显示在问题和答案面
- 图片自动适配大小，保持美观

### ✅ 2. 随机批量练习

**需求**：用例多时，每次随机抽30张，用户可换一批

**实现**：
- 默认加载30条随机用例（可配置 `BATCH_SIZE`）
- 顶部显示"当前批次：30 条用例"
- "换一批"按钮：重新加载新的随机30条
- 显示进度：已查看 X / 30
- 本批次完成后显示"本批次 30 条已完成"，可继续换一批

### ✅ 3. 等级说明

**需求**：L1-L4的分层分级需要加说明

**实现**：
- 在闪卡练习页面底部添加"等级说明"模块
- 每个等级包含：
  - **L1 直接召回**：无需推理，直接提取信息
  - **L2 模糊单跳**：需一次推理或模糊匹配
  - **L3 多跳推理**：需2-3步连续推理
  - **L4 聚合归类**：检索多条记忆并归类
  - **L5 复杂计算**：需复杂计算和深度分析
- 每个等级配有：名称、描述、示例场景

### ✅ 4. 后端数据持久化

**需求**：部署到服务器，用户上传的用例保存到后台

**实现**：
- **数据库**：SQLite (`tastetask.db`)
- **表结构**：
  - `cases` 表：存储所有用例
  - `favorites` 表：存储用户收藏记录
- **功能**：
  - 所有用户提交的用例持久化到数据库
  - 预置29条黄金用例（来自原始HTML）
  - 图片以 base64 格式存储在数据库中
  - 每个用户有唯一ID（存储在 localStorage）

### ✅ 5. 管理员功能

**需求**：管理员（密码：shijinshi1994）可以删除用例

**实现**：
- **密码验证**：`shijinshi1994`
- **权限**：
  - 删除用户提交的用例（预置用例不可删除）
  - 弹窗密码验证，防止误操作
- **API端点**：
  - `DELETE /api/cases/:id` - 删除用例（需密码）
  - `PUT /api/cases/:id` - 更新用例（需密码）

### ✅ 6. 收藏功能

**需求**：每个用例增加收藏按钮，后台统计收藏次数

**实现**：
- **前端**：
  - 每条用例显示收藏按钮（☆/★）
  - 显示收藏次数：`(n)`
  - 点击切换收藏状态
- **后端**：
  - `favorites` 表记录用户收藏
  - 防止重复收藏（UNIQUE约束）
- **排行榜**：
  - 显示收藏最多的5条用例
  - 按收藏次数从高到低排序
  - 在测试集总览页面展示

### ✅ 7. 网站命名

**需求**：网站名字叫 "Taste-Task 试金石"

**实现**：
- 网页标题：`Taste-Task 试金石 · AI记忆能力测试集`
- 页面顶部：`Taste-Task 试金石`
- 副标题：`AI记忆能力黄金测试集 · 让优秀被看见`

## 技术架构

### 前端
- **框架**：React 18 (CDN)
- **构建**：Babel standalone (浏览器端编译)
- **样式**：内联 CSS（无需额外样式文件）
- **状态管理**：React Hooks (useState, useEffect, useCallback)

### 后端
- **框架**：Express.js
- **数据库**：SQLite3
- **认证**：简单的密码验证
- **用户识别**：localStorage + HTTP Header

### 部署
- **支持**：PM2, systemd, Docker
- **反向代理**：Nginx
- **数据备份**：文件复制 + cron

## API 接口文档

### 获取用例列表
```http
GET /api/cases?random=true&limit=30
```
响应：用例数组（包含收藏信息）

### 获取单个用例
```http
GET /api/cases/:id
```

### 添加用例
```http
POST /api/cases
Content-Type: application/json

{
  "query": "查询内容",
  "level": "L1",
  "sheet": "对话记忆",
  "source": "系统来源",
  "preset": "预设数据",
  "golden": "期望答案",
  "skill": "考察能力",
  "note": "备注",
  "imageData": "base64图片数据"
}
```

### 收藏/取消收藏
```http
POST /api/cases/:id/favorite
```

### 删除用例（管理员）
```http
DELETE /api/cases/:id
Content-Type: application/json

{
  "password": "shijinshi1994"
}
```

### 收藏排行榜
```http
GET /api/cases/top/favorites?limit=10
```

### 统计信息
```http
GET /api/stats
```
响应：
```json
{
  "total": 29,
  "byLevel": [...],
  "bySheet": [...],
  "totalFavorites": 0,
  "topCases": [...]
}
```

## 数据库结构

### cases 表
```sql
CREATE TABLE cases (
  id TEXT PRIMARY KEY,           -- 用例ID
  query TEXT NOT NULL,           -- 查询问题
  level TEXT NOT NULL,           -- 等级 L1-L5
  sheet TEXT NOT NULL,           -- 数据源
  source TEXT,                   -- 具体来源
  preset TEXT,                   -- 预设数据
  golden TEXT NOT NULL,          -- 期望答案
  skill TEXT,                    -- 考察能力
  note TEXT,                     -- 备注
  image_data TEXT,               -- 图片base64
  user_added INTEGER,            -- 是否用户添加
  created_at DATETIME,           -- 创建时间
  updated_at DATETIME            -- 更新时间
);
```

### favorites 表
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY,
  case_id TEXT NOT NULL,         -- 用例ID
  user_id TEXT NOT NULL,         -- 用户ID
  created_at DATETIME,           -- 收藏时间
  UNIQUE(case_id, user_id)       -- 防止重复收藏
);
```

## 使用说明

### 闪卡练习
1. 点击卡片查看答案
2. 左右滑动或使用按钮切换
3. 点击"换一批"加载新的随机用例
4. 收藏认为优秀的用例

### 添加用例
1. 点击"+ 添加用例"标签
2. 填写表单（标*为必填）
3. 可上传图片附件
4. 点击"添加到测试集"

### 管理员删除
1. 在"测试集总览"中找到用户添加的用例
2. 点击"删除"按钮
3. 输入管理员密码：`shijinshi1994`
4. 确认删除

## 未来优化方向

1. **用户系统**：完整的用户注册/登录
2. **标签系统**：用例标签分类
3. **评论功能**：用例评论和讨论
4. **导出功能**：导出测试报告
5. **批量导入**：Excel导入用例
6. **搜索功能**：全文搜索用例
7. **权限管理**：多级管理员权限
8. **数据分析**：测试数据可视化

## 文件结构

```
tastetask/
├── public/
│   └── index.html          # 前端页面
├── server.js               # 后端服务器
├── init-db.js             # 数据库初始化脚本
├── package.json           # 项目配置
├── .gitignore            # Git忽略文件
├── README.md             # 项目说明
├── DEPLOYMENT.md         # 部署指南
├── start.sh              # 快速启动脚本
├── index.original.html   # 原始HTML（保留）
└── tastetask.db          # SQLite数据库（运行时生成）
```

## 技术特点

1. **零构建**：前端使用 CDN + Babel，无需 npm 构建流程
2. **轻量级**：SQLite 数据库，无需额外数据库服务
3. **易部署**：单文件部署，PM2 一键启动
4. **高性能**：异步API，支持并发请求
5. **可扩展**：模块化设计，易于添加新功能

## 总结

Taste-Task 试金石 实现了所有需求功能：
- ✅ 闪卡答案面显示图片
- ✅ 随机30条批量练习，可换一批
- ✅ 等级说明 L1-L5
- ✅ 后端数据持久化
- ✅ 管理员删除功能（密码验证）
- ✅ 收藏功能 + 排行榜
- ✅ 网站命名为 "Taste-Task 试金石"

项目已可部署到生产环境，供团队使用。
