# Taste-Task 试金石 - 最便宜部署方案

## 💰 最便宜方案排行榜

### 方案一：免费方案（0元/年）⭐推荐

#### 1. Render.com（免费）
- **配置**：512MB RAM，0.1 CPU
- **流量**：750小时/月
- **限制**：15分钟无活动会休眠
- **适合**：个人测试用
- **网址**：https://render.com

#### 2. Railway.app（免费额度）
- **配置**：512MB RAM
- **流量**：$5免费额度/月
- **限制**：休眠制
- **网址**：https://railway.app

#### 3. Koyeb（免费）
- **配置**：512MB RAM，0.1 CPU
- **流量**：无限制（但有休眠）
- **网址**：https://www.koyeb.com

### 方案二：超低价方案（1-3元/月）

#### 1. 腾讯云轻量服务器
- **配置**：1核2GB
- **价格**：**1元/首月**（新用户）
- **续费**：约70元/年
- **网址**：https://cloud.tencent.com/act/lighthouse

#### 2. 华为云HECS
- **配置**：1核2GB
- **价格**：**9元/年**（新用户）
- **网址**：https://www.huaweicloud.com/product/ecsc.html

#### 3. 阿里云ECS
- **配置**：1核1GB（突发性能实例）
- **价格**：约**30元/年**（新用户）
- **网址**：https://www.aliyun.com/product/ecs

### 方案三：使用免费资源

#### 学校/公司资源
- 校内服务器
- 实验室机器
- 公司测试服务器

#### 自己的设备
- 树莓派（电费忽略）
- 旧电脑（内网穿透）
- 家用NAS

---

## 🎯 最推荐：腾讯云轻量服务器

### 为什么推荐？
✅ **最便宜**：新用户1元首月
✅ **最简单**：一键部署，不需要懂技术
✅ **最稳定**：不会免费版那样休眠
✅ **最快速**：5分钟搞定

### 购买步骤

#### 1. 注册腾讯云
```
网址：https://cloud.tencent.com/
1. 注册账号
2. 实名认证（需要身份证）
```

#### 2. 购买轻量服务器
```
1. 进入：https://cloud.tencent.com/act/lighthouse
2. 选择：1核2GB
3. 系统：Ubuntu 20.04
4. 价格：1元（首月）
5. 购买
```

#### 3. 获取服务器信息
- 服务器公网IP
- 登录密码（设置或重置）

---

## 🚀 一键部署脚本（最简单）

### 方法一：使用我提供的脚本

#### 1. 连接服务器
```bash
# 在本地终端执行
ssh root@你的服务器IP
# 输入密码
```

#### 2. 一键部署
```bash
# 复制粘贴这条命令（一次性完成所有配置）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
npm install -g pm2

# 上传代码（在本地执行）
scp -r ~/Desktop/Claude\ Code/tastetask root@你的服务器IP:/root/

# 回到服务器，安装和启动
cd /root/tastetask
npm install
node init-db.js
pm2 start server.js --name tastetask
pm2 startup
pm2 save
```

#### 3. 访问网站
```
浏览器打开：http://你的服务器IP:3000
```

### 方法二：手动部署（更可控）

#### Step 1: 连接服务器
```bash
ssh root@你的服务器IP
```

#### Step 2: 安装Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: 安装PM2
```bash
sudo npm install -g pm2
```

#### Step 4: 上传代码（在本地执行）
```bash
scp -r ~/Desktop/Claude\ Code/tastetask root@你的服务器IP:/root/
```

#### Step 5: 安装依赖（回到服务器）
```bash
cd /root/tastetask
npm install --production
```

#### Step 6: 初始化数据库
```bash
node init-db.js
```

#### Step 7: 启动服务
```bash
pm2 start server.js --name tastetask
pm2 startup
pm2 save
```

#### Step 8: 验证
```bash
pm2 status
```

显示 `online` 就成功了！

---

## 🎁 免费域名（可选）

### 方案1：免费子域名
- **Freenom**：www.xxx.tk / xxx.ml / xxx.ga
- **EU.org**：免费域名（需要申请）

### 方案2：临时域名
- 直接用IP访问（最简单）
- `http://你的服务器IP:3000`

---

## 💡 省钱技巧

### 1. 使用新用户优惠
- 腾讯云：1元首月
- 阿里云：3个月免费试用
- 华为云：9元/年

### 2. 按需付费
- 流量小就用免费版
- 流量大再升级

### 3. 续费优惠
- 经常有活动，关注一下
- 可以购买多年（更便宜）

### 4. 学生优惠
- 腾讯云+阿里云都有学生优惠
- 通常是半价或免费

---

## 🔧 域名解析（可选，更专业）

### 1. 购买域名（10-50元/年）
- 阿里云万网
- 腾讯云DNSPod
- Cloudflare（免费DNS）

### 2. 解析域名
```
类型：A
主机记录：@
记录值：你的服务器IP
```

### 3. 访问
```
http://你的域名.com
```

---

## 📊 成本对比

| 方案 | 首月 | 次月 | 年费 | 限制 |
|------|------|------|------|------|
| **腾讯云轻量** | 1元 | 10元 | 70元 | 无 |
| **华为云** | 9元 | - | 9元 | 新用户 |
| **阿里云ECS** | 30元 | - | 30元 | 新用户 |
| **Render免费** | 0元 | 0元 | 0元 | 休眠 |
| **Railway免费** | 0元 | 0元 | 0元 | 休眠 |

---

## 🎯 我的建议

### 如果你是**纯测试**：
→ 用 **Render免费版**（0元）

### 如果你是**小团队**（<10人）：
→ 用 **腾讯云轻量**（1元首月，70元/年）

### 如果你是**长期使用**：
→ 用 **华为云9元/年**（最便宜）

---

## ⚡ 快速开始（推荐路线）

### 最快5分钟上线：

1. **购买腾讯云轻量服务器（1元）**
   - 网址：https://cloud.tencent.com/act/lighthouse
   - 选择：1核2GB，Ubuntu 20.04

2. **等待1-2分钟**服务器创建完成

3. **连接服务器**
   ```bash
   ssh root@服务器IP
   ```

4. **执行一键命令**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

5. **上传代码**（在本地执行）
   ```bash
   scp -r ~/Desktop/Claude\ Code/tastetask root@服务器IP:/root/
   ```

6. **启动服务**（回到服务器）
   ```bash
   cd /root/tastetask
   npm install
   node init-db.js
   pm2 start server.js --name tastetask
   pm2 save
   ```

7. **访问网站**
   ```
   http://服务器IP:3000
   ```

✅ 完成！总花费：**1元**

---

## 📞 需要帮助？

告诉我你选择了哪个方案，我可以：
1. 提供详细的命令清单
2. 帮你解决遇到的问题
3. 优化配置和性能

你现在想用哪个方案？
