# Taste-Task 试金石 - GitHub上传 + Railway部署指南

## 🚀 完整部署步骤（10分钟搞定）

---

## 第1步：创建GitHub仓库

### 1.1 打开GitHub
访问：https://github.com/

### 1.2 创建新仓库
1. 点击右上角 "+" → "New repository"
2. 填写信息：
   - **Repository name**: `tastetask`（或其他名字）
   - **Description**: Taste-Task 试金石 - AI记忆能力测试集
   - **Public**: 选 Public（免费）
   - **不要勾选** "Add a README file"
3. 点击"Create repository"

### 1.3 复制仓库地址
创建后会显示地址，类似：
```
https://github.com/你的用户名/tastetask.git
```
复制这个地址！

---

## 第2步：上传代码到GitHub

### 在你的电脑上，打开终端，执行：

```bash
# 进入项目目录
cd ~/Desktop/Claude\ Code/tastetask

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Taste-Task 试金石"

# 添加远程仓库（替换成你的GitHub地址）
git remote add origin https://github.com/你的用户名/tastetask.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

**如果提示登录GitHub**：
- 输入GitHub用户名和密码
- 或使用Personal Access Token

### 完成后
你的代码就上传到GitHub了！
访问：https://github.com/你的用户名/tastetask

---

## 第3步：部署到Railway

### 3.1 打开Railway
访问：https://railway.app/

### 3.2 登录
- 点击"Login"
- 使用GitHub账号登录
- 授权Railway访问你的GitHub

### 3.3 创建新项目
1. 点击左上角"New Project"按钮
2. 选择"Deploy from GitHub repo"

### 3.4 选择你的仓库
1. 在搜索框输入"tastetask"
2. 找到你的仓库
3. 点击"Import"

### 3.5 等待自动部署
- Railway会自动检测到你的Node.js项目
- 自动安装依赖
- 自动启动服务器
- **等待2-3分钟**

### 3.6 获取访问地址
部署完成后：
1. 点击项目名称进入详情页
2. 在顶部会看到你的域名，类似：
   ```
   https://tastetask-production.up.railway.app
   ```
3. ✅ 点击访问，你的网站就上线了！

---

## 第4步：绑定你的域名（可选）

### 4.1 在Railway添加域名
1. 在项目页面点击"Settings"标签
2. 点击左侧"Domains"
3. 点击"Add Domain"
4. 输入你的域名，比如：`tastetask.yourdomain.com`
5. 点击"Add"

### 4.2 复制DNS记录
Railway会显示你需要添加的DNS记录：
```
Type: CNAME
Name: tastetask
Value: up.railway.app
```

### 4.3 在域名管理中添加DNS记录
1. 登录你的域名管理平台（阿里云/腾讯云等）
2. 找到DNS解析管理
3. 添加记录：
   - **记录类型**: CNAME
   - **主机记录**: tastetask（或你想用的子域名）
   - **记录值**: up.railway.app
4. 保存

### 4.4 等待DNS生效
- 通常需要10-30分钟
- 生效后访问：`http://tastetask.yourdomain.com`

---

## 🎯 完成后

### 你会得到：
1. **Railway免费域名**：
   - `https://tastetask-production.up.railway.app`
   - 立即可用，有HTTPS

2. **自己的域名**（可选）：
   - `http://tastetask.yourdomain.com`
   - 需要等待DNS生效

### 分享给同事：
- 直接分享Railway域名
- 或分享你自己的域名
- 两者都可以访问！

---

## ⚠️ 注意事项

### 免费额度
- Railway每月$5免费额度
- 小团队使用够了
- 超过后会暂停或提醒升级

### 数据持久化
- Railway重启后数据会丢失
- 如果需要持久化，需要配置数据库（Railway提供PostgreSQL）
- 但测试用够了

### 性能
- Railway免费版会休眠
- 首次访问可能需要10-30秒启动
- 活跃后访问速度快

---

## 📊 域名对比

| 域名类型 | 优点 | 缺点 |
|---------|------|------|
| **Railway域名** | 立即可用，HTTPS | 域名长，可能慢 |
| **自己的域名** | 简短好记 | 需要DNS配置 |

---

## ✅ 快速检查清单

部署前：
- [ ] 代码已上传到GitHub
- [ ] .gitignore文件已创建
- [ ] Procfile文件已创建

部署中：
- [ ] Railway已连接GitHub
- [ ] 项目已成功导入
- [ ] 等待部署完成

部署后：
- [ ] 能访问Railway域名
- [ ] 测试基本功能
- [ ] （可选）配置自己的域名

---

## 🚀 现在开始吧！

按照上面的步骤：
1. 先push到GitHub
2. 然后到Railway部署
3. 10分钟搞定！

遇到问题随时告诉我！
