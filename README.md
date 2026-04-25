# Taste-Task 试金石

> AI 记忆能力黄金测试集管理平台 · 闪卡式抽查 + 团队协作收集

## 🎯 项目简介

Taste-Task 试金石是一个用于团队管理 AI 助手「记忆能力」黄金测试集的平台。每条用例由 Query（查询）+ 预设数据 + Golden Answer（期望输出）组成，支持：
- ✅ 闪卡式抽查（Tinder 滑动体验）
- ✅ 团队协作收集用例
- ✅ 收藏排序功能
- ✅ 管理员审核机制
- ✅ 多数据源覆盖

### 数据源覆盖

对话记忆、本机日历、备忘录、短信、联系人、图库、文件、多源混合、边界负样本。

### 等级体系

- **L1** - 直接召回：无需推理，直接提取信息
- **L2** - 模糊单跳：需一次推理或模糊匹配
- **L3** - 多跳推理：需2-3步连续推理
- **L4** - 聚合归类：检索多条记忆并归类
- **L5** - 复杂计算：需复杂计算和深度分析

---

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/Jam-free/tastetask.git
cd tastetask

# 安装依赖
npm install

# 初始化数据库（导入29条预置用例）
node init-db.js

# 启动服务器
npm start

# 访问
open http://localhost:3000
```

### 部署到云端

推荐使用 **Railway** 或 **Render** 进行一键部署：

#### Railway（推荐，无需银行卡）
1. 访问：https://railway.app/
2. GitHub 登录
3. New Project → Deploy from GitHub repo
4. 选择 `tastetask` 仓库
5. 等待2-3分钟自动部署

#### Render（需要添加支付方式）
1. 访问：https://render.com/
2. GitHub 登录
3. New Web Service → 选择仓库
4. 自动部署

详细部署指南请查看：
- [Railway 部署指南](./DEPLOY_TO_RAILWAY.md)
- [Render 部署指南](./DEPLOY_TO_RENDER.md)
- [生产环境部署指南](./DEPLOYMENT_PRODUCTION.md)

---

## ✨ 主要功能

### 1. 闪卡练习
- 🔀 **左右滑动**：Tinder 式交互体验
- 🔄 **随机抽查**：每次随机抽取30张
- 🎴 **翻面查看**：点击卡片查看 Golden Answer
- 🔁 **换一批**：随时更换新的随机用例
- 📊 **进度追踪**：实时显示已完成数量

### 2. 测试集总览
- 📋 **表格展示**：查看所有用例
- 🔍 **多维度筛选**：按等级、数据源筛选
- 📶 **排序功能**：按编号或收藏数排序
- 📖 **详情展开**：查看完整用例信息
- 🗑️ **管理员删除**：密码验证后删除用例

### 3. 添加用例
- ➕ **简单表单**：结构化填写用例信息
- 📎 **图片上传**：支持截图、图片附件
- 🏷️ **分类标签**：L1-L5 等级 + 数据源
- ✅ **即时生效**：提交后立即可见

### 4. 收藏功能
- ⭐ **一键收藏**：标记优秀用例
- 🏆 **收藏排行榜**：展示最受欢迎的用例
- 📊 **全局统计**：显示每条用例的总收藏数
- 👥 **团队协作**：多人收藏数据聚合

### 5. 管理员功能
- 🔐 **密码验证**：管理员密码保护（`shijinshi1994`）
- 🗑️ **删除用例**：可删除任意用例（仅管理员）
- 🛡️ **权限控制**：前端验证 + 后端API验证

### 6. AI助手集成
- 🎤 **语音助手按钮**：每个用例都可以发给AI助手测试
- 📱 **多平台支持**：华为小艺、小米小爱、OPPO小布等
- 🤖 **智能识别**：自动检测平台，选择最佳调用方式

### 7. 等级说明
- 📚 **详细说明**：L1-L5 各等级的含义
- 💡 **示例场景**：每个等级的具体示例
- 🎯 **能力标注**：每条用例标注考察能力

---

## 📁 项目结构

```
tastetask/
├── public/                 # 前端资源
│   └── index.html         # React 单页应用
├── server.js              # Express 后端服务器
├── init-db.js            # 数据库初始化脚本
├── package.json          # 项目配置
├── Procfile              # 部署配置
├── .gitignore            # Git 忽略文件
├── tastetask.db          # SQLite 数据库（运行时生成）
├── docs/                 # 文档目录
│   ├── README.md         # 项目说明（本文件）
│   ├── FEATURES.md       # 功能详细说明
│   ├── DEPLOYMENT.md     # 部署指南
│   ├── DEPLOY_TO_RAILWAY.md   # Railway 部署
│   ├── DEPLOY_TO_RENDER.md    # Render 部署
│   ├── DEPLOYMENT_PRODUCTION.md  # 生产部署
│   ├── ALIYUN_BUY_GUIDE.md    # 阿里云购买指南
│   ├── HUAWEI_CLOUD_BUY_GUIDE.md  # 华为云购买指南
│   ├── AI_BUTTON_DESIGN.md      # AI按钮设计说明
│   ├── VOICE_ASSISTANT_GUIDE.md # 语音助手指南
│   └── DEPLOYMENT_CHEAPEST.md  # 最便宜部署方案
└── README.md             # 项目说明（本文件）
```

---

## 🔧 技术栈

### 前端
- **框架**：React 18 (CDN)
- **构建**：Babel standalone (浏览器端编译)
- **样式**：内联 CSS（CSS 变量 + 暗色模式）
- **状态管理**：React Hooks

### 后端
- **框架**：Node.js + Express
- **数据库**：SQLite3 (better-sqlite3)
- **认证**：密码验证（管理员）
- **文件上传**：Multer

### 部署
- **容器化**：支持 Docker
- **进程管理**：PM2
- **反向代理**：Nginx

---

## 📊 数据模型

### Case（用例）
```typescript
{
  id: string              // "XY-01" | "USR-{timestamp}"
  query: string           // 用户查询
  level: "L1"|"L2"|"L3"|"L4"|"L5"
  sheet: string           // 数据源大类
  source: string          // 具体来源
  preset: string          // 预设数据
  golden: string          // 期望输出
  skill: string           // 考察能力
  note: string            // 难点备注
  imageData: string       // 附图（Base64）
  user_added: boolean     // 是否用户添加
  is_favorite: boolean    // 是否已收藏
  favorite_count: number  // 收藏次数
  created_at: Date
}
```

### Favorite（收藏）
```typescript
{
  caseId: string
  userId: string          // 用户ID（UUID）
  created_at: Date
}
// 联合主键 (caseId, userId)
```

---

## 🔌 API 接口

### 用例管理
- `GET /api/cases` - 获取用例列表
- `GET /api/cases/:id` - 获取单个用例
- `POST /api/cases` - 添加新用例
- `DELETE /api/cases/:id` - 删除用例（管理员）

### 收藏功能
- `POST /api/cases/:id/favorite` - 收藏/取消收藏
- `GET /api/cases/top/favorites` - 收藏排行榜

### 统计信息
- `GET /api/stats` - 获取统计信息
- `GET /api/health` - 健康检查

### 管理员
- `DELETE /api/cases/:id` - 删除用例（需密码）
- `PUT /api/cases/:id` - 更新用例（需密码）

详细的 API 文档请查看：[API.md](./API.md)

---

## 🔐 安全特性

### 访问控制
- ✅ **入场验证**：首次访问需回答问题
- ✅ **管理员密码**：`shijinshi1994`
- ✅ **密码验证**：删除操作需密码确认

### 数据保护
- ✅ **用户隔离**：每个用户有唯一ID
- ✅ **SQL注入防护**：参数化查询
- ✅ **XSS防护**：React 自动转义
- ✅ **文件上传限制**：大小和类型验证

### 隐私保护
- ✅ **不收集敏感信息**：用户ID随机生成
- ✅ **本地优先**：数据优先存储在本地
- ✅ **透明化**：开源代码，可自部署

---

## 🌍 部署选项

### 免费方案
- **Railway**：$5/月免费额度，无需银行卡
- **Render**：750小时/月免费，需添加支付方式
- **本地部署**：完全免费，可内网穿透

### 低价方案
- **华为云**：9元/年（新用户）
- **腾讯云**：1元首月，70元/年
- **阿里云**：30-50元/年（新用户）

详细价格对比请查看：[最便宜部署方案](./DEPLOYMENT_CHEAPEST.md)

---

## 📚 文档索引

### 项目文档
- [功能详细说明](./FEATURES.md)
- [架构设计](./ARCHITECTURE.md)
- [API 文档](./API.md)
- [待办清单](./TODO.md)

### 部署文档
- [部署指南](./DEPLOYMENT.md)
- [Railway 部署](./DEPLOY_TO_RAILWAY.md)
- [Render 部署](./DEPLOY_TO_RENDER.md)
- [生产环境部署](./DEPLOYMENT_PRODUCTION.md)
- [最便宜部署方案](./DEPLOYMENT_CHEAPEST.md)

### 购买指南
- [阿里云购买指南](./ALIYUN_BUY_GUIDE.md)
- [华为云购买指南](./HUAWEI_CLOUD_BUY_GUIDE.md)

### 功能说明
- [AI按钮设计说明](./AI_BUTTON_DESIGN.md)
- [语音助手指南](./VOICE_ASSISTANT_GUIDE.md)
- [语音功能总结](./VOICE_FEATURE_SUMMARY.md)

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 开发路线图

### v1（当前版本）
- ✅ 单页 HTML 实现
- ✅ 所有数据存 localStorage
- ✅ 完整的 UI 功能
- ✅ 预置 29 条黄金用例

### v2（规划中）
- [ ] 前后端分离架构
- [ ] SQLite 数据库
- [ ] 用户系统（可选）
- [ ] 图片对象存储
- [ ] 更多部署选项

详见 [TODO.md](./TODO.md)

---

## 💡 使用场景

### 个人使用
- 📚 **学习AI能力**：了解AI的记忆能力边界
- 🔬 **测试AI助手**：系统地测试不同AI助手
- 📊 **能力评估**：评估AI助手的记忆能力

### 团队使用
- 👥 **团队协作**：团队成员共同收集用例
- 🏆 **优秀用例发现**：通过收藏发现优秀用例
- 📈 **能力对比**：对比不同AI助手的能力
- 🎯 **产品优化**：基于测试结果优化AI产品

---

## ❓ 常见问题

### Q: 入场密码是什么？
A: 回答"陈建辉"即可进入网站。

### Q: 管理员密码是什么？
A: `shijinshi1994`

### Q: 如何备份数据？
A: 定期备份 `tastetask.db` 文件即可。

### Q: 可以多人使用吗？
A: 可以！部署到服务器后，团队可以共享数据。

### Q: 支持哪些AI助手？
A: 目前支持华为小艺、小米小爱、OPPO小布等，持续增加中。

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

**Jam-free** - GitHub: [@Jam-free](https://github.com/Jam-free)

---

## 🙏 致谢

感谢所有贡献者和使用者的支持！

---

**项目地址**: https://github.com/Jam-free/tastetask

**在线演示**: 即将上线

---

*Taste-Task 试金石 - 让优秀被看见* ✨
