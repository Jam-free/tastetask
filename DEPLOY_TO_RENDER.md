# Taste-Task 试金石 - Render.com 部署指南

## 🚀 3分钟部署到Render（超简单）

---

## 第1步：登录Render（30秒）

1. 打开：https://render.com/
2. 点击右上角"Login"
3. 点击"Sign up with GitHub"
4. 授权Render访问你的GitHub

---

## 第2步：创建Web Service（1分钟）

1. 登录后点击右上角"+"
2. 选择"New Web Service"

3. **连接GitHub仓库**：
   - 点击"Connect GitHub"
   - 授权Render访问你的仓库
   - 在搜索框输入"tastetask"
   - 找到你的仓库：`Jam-free/tastetask`
   - 点击"Connect"

---

## 第3步：配置部署（30秒）

Render会自动填充配置，检查一下：

### 基础配置
- **Name**: `tastetask`（自动填充）
- **Region**: Singapore（新加坡）或 Oregon（俄勒冈）
- **Branch**: `main`（自动填充）
- **Root Directory**: 留空
- **Runtime**: `Node`（自动检测）

### 构建和启动
- **Build Command**: `npm install`（自动填充）
- **Start Command**: `node server.js`（自动填充）

### 实例类型
- **Type**: `Free`（免费版）
- **RAM**: 512 MB
- **CPU**: 0.1

### 环境变量（可选）
不需要添加，跳过

---

## 第4步：部署（1-2分钟）

1. 检查配置无误后，点击底部的"Create Web Service"
2. **等待1-2分钟**自动部署
3. 可以点击"Live Logs"查看部署日志
4. 看到日志显示"Your service is live"就成功了！

---

## 第5步：访问你的网站（10秒）

部署成功后：

1. 在Service页面顶部会显示你的域名：
   ```
   https://tastetask.onrender.com
   ```

2. 点击访问，你的网站就上线了！

3. 分享给同事：
   - 直接分享这个链接
   - 链接永久有效
   - 有HTTPS

---

## ✅ 完成！

### 你现在有了：
- ✅ 公开访问的网站
- ✅ HTTPS自动配置
- ✅ 自动部署（推送代码自动更新）
- ✅ 免费托管

### 网站地址：
```
https://tastetask.onrender.com
```

---

## 🎁 额外功能

### 自动部署
- 当你推送新代码到GitHub
- Render会自动重新部署
- 无需手动操作

### 环境变量
如果需要配置管理员密码等：
1. 在Service页面点击"Environment"
2. 添加环境变量
3. 重新部署

### 日志查看
- 点击"Logs"查看实时日志
- 点击"Events"查看部署历史

---

## ⚠️ 注意事项

### 免费版限制
- **休眠**：15分钟无访问会休眠
- **启动时间**：休眠后首次访问需要10-30秒启动
- **每月时长**：750小时/月（够了）
- **数据持久化**：Render重启后数据会丢失

### 数据备份
- SQLite数据在Render重启后会丢失
- 如果需要持久化数据，建议使用Render PostgreSQL（需付费）
- 或者定期导出数据备份

---

## 🔄 更新网站

当你修改代码后：

```bash
git add .
git commit -m "更新内容"
git push
```

Render会自动检测并重新部署！

---

## 📊 性能说明

### 免费版性能
- RAM: 512MB
- CPU: 0.1（共享）
- 适合：个人使用、小团队（<10人）

### 升级到付费版
如果流量大：
- Starter版：$7/月
- 更好的性能和稳定性

---

## 🎯 快速开始

**现在就去Render部署！**

1. 打开：https://render.com/
2. GitHub登录
3. 创建Web Service
4. 选择你的仓库
5. 点击部署

**3分钟搞定！**

---

## 💡 和Vercel的区别

| 功能 | Render | Vercel |
|------|--------|--------|
| Node.js服务器 | ✅ 支持 | ❌ 仅Serverless |
| SQLite文件数据库 | ✅ 支持 | ❌ 不支持 |
| 长期运行进程 | ✅ 支持 | ❌ 函数式 |
| 静态网站 | ✅ 支持 | ✅ 支持 |
| React/Vue前端 | ✅ 支持 | ✅ 支持 |
| 免费额度 | ✅ 750小时/月 | ✅ 100GB带宽/月 |

---

## 🚀 准备好了吗？

打开Render开始部署吧！

遇到问题随时告诉我！
