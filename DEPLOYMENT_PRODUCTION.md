# Taste-Task 试金石 - 部署上线指南

## 🚀 部署方案选择

### 方案一：云服务器部署（推荐）
适合：有服务器经验，需要完全控制

**服务器推荐**：
- 阿里云ECS
- 腾讯云CVM
- 华为云ECS

**配置要求**：
- CPU：1核起
- 内存：1GB起
- 带宽：1Mbps起
- 系统：Ubuntu 20.04 或 CentOS 7+

### 方案二：容器化部署
适合：熟悉Docker，需要快速部署

### 方案三：Serverless部署
适合：小流量，按需付费

---

## 📋 部署前准备清单

### 1. 服务器准备
- [ ] 购买云服务器
- [ ] 获取服务器IP和密码
- [ ] 配置安全组（开放3000端口）
- [ ] 域名解析（可选）

### 2. 本地准备
- [ ] 备份数据库文件
- [ ] 确认代码可以运行
- [ ] 准备部署脚本

---

## 🛠️ 方案一：云服务器部署（详细步骤）

### Step 1: 连接服务器

```bash
# 使用SSH连接
ssh root@your_server_ip

# 或使用密钥
ssh -i your_key.pem root@your_server_ip
```

### Step 2: 安装Node.js

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### Step 3: 安装PM2（进程管理）

```bash
sudo npm install -g pm2

# 验证
pm2 -v
```

### Step 4: 上传代码

**方法A：使用SCP上传**
```bash
# 在本地执行
scp -r ~/Desktop/Claude\ Code/tastetask root@your_server_ip:/root/
```

**方法B：使用Git**
```bash
# 在服务器上执行
cd /root
git clone your_repo_url
cd tastetask
```

**方法C：手动上传**
- 使用 FileZilla 或 WinSCP
- 上传整个 tastetask 文件夹

### Step 5: 安装依赖并初始化

```bash
cd /root/tastetask

# 安装依赖
npm install --production

# 初始化数据库（首次部署）
node init-db.js

# 测试启动
npm start
```

### Step 6: 使用PM2管理

```bash
# 启动应用
pm2 start server.js --name tastetask

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs tastetask

# 重启应用
pm2 restart tastetask

# 停止应用
pm2 stop tastetask
```

### Step 7: 配置防火墙

```bash
# 允许3000端口
sudo ufw allow 3000

# 如果使用Nginx，允许80/443
sudo ufw allow 80
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
```

### Step 8: 配置Nginx反向代理（可选但推荐）

```bash
# 安装Nginx
sudo apt install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/tastetask
```

**Nginx配置内容**：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 支持大文件上传
        client_max_body_size 10M;
    }
}
```

**启用配置**：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/tastetask /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### Step 9: 配置HTTPS（使用Let's Encrypt）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动配置SSL
sudo certbot --nginx -d your-domain.com

# 证书会自动续期
```

### Step 10: 配置自动备份

```bash
# 创建备份脚本
sudo nano /root/backup.sh
```

**备份脚本内容**：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
cp /root/tastetask/tastetask.db $BACKUP_DIR/tastetask_$DATE.db

# 删除7天前的备份
find $BACKUP_DIR -name "tastetask_*.db" -mtime +7 -delete

echo "Backup completed: tastetask_$DATE.db"
```

**设置定时任务**：
```bash
# 添加执行权限
chmod +x /root/backup.sh

# 编辑crontab
crontab -e

# 添加每天凌晨2点备份
0 2 * * * /root/backup.sh >> /root/backup.log 2>&1
```

---

## 🐳 方案二：Docker部署

### 创建Dockerfile

```bash
cd /root/tastetask
nano Dockerfile
```

**Dockerfile内容**：
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制所有文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t tastetask .

# 运行容器
docker run -d \
  --name tastetask \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  tastetask

# 查看日志
docker logs -f tastetask
```

### 使用Docker Compose（推荐）

**创建 docker-compose.yml**：
```yaml
version: '3.8'
services:
  tastetask:
    build: .
    container_name: tastetask
    ports:
      - "3000:3000"
    volumes:
      - ./tastetask.db:/app/tastetask.db
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
```

**启动**：
```bash
docker-compose up -d
```

---

## 📊 部署后检查

### 1. 检查服务状态

```bash
# 检查PM2状态
pm2 status

# 检查端口监听
netstat -tlnp | grep 3000

# 检查进程
ps aux | grep server.js
```

### 2. 测试API

```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取统计
curl http://localhost:3000/api/stats
```

### 3. 浏览器访问

```
http://your_server_ip:3000
或
http://your-domain.com
```

### 4. 验证功能

- [ ] 首页正常打开
- [ ] 闪卡练习正常
- [ ] 添加用例正常
- [ ] 收藏功能正常
- [ ] AI助手按钮正常

---

## 🔧 常见问题解决

### 问题1：端口被占用

```bash
# 查找占用进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 问题2：数据库权限问题

```bash
# 设置正确的权限
chmod 644 /root/tastetask/tastetask.db
chmod 755 /root/tastetask
```

### 问题3：PM2应用不自动重启

```bash
# 重新设置开机自启
pm2 delete tastetask
pm2 start server.js --name tastetask
pm2 startup
pm2 save
```

### 问题4：Nginx 502错误

```bash
# 检查Node.js服务是否运行
pm2 status

# 检查Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

---

## 📈 性能优化

### 1. 启用Gzip压缩

在Nginx配置中添加：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. 配置缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. PM2集群模式

```bash
# 启动多个进程
pm2 start server.js -i max --name tastetask
```

---

## 🔐 安全建议

### 1. 修改管理员密码

在 `server.js` 中修改密码：
```javascript
if (password !== '你的新密码') {
  return res.status(403).json({ error: '管理员密码错误' });
}
```

### 2. 配置防火墙

```bash
# 只允许必要的端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. 定期更新

```bash
# 定期更新系统
sudo apt update && sudo apt upgrade -y

# 更新Node.js依赖
npm audit fix
```

### 4. 配置fail2ban

```bash
# 安装fail2ban
sudo apt install -y fail2ban

# 防止暴力破解SSH
```

---

## 📊 监控和维护

### 1. 日志管理

```bash
# PM2日志
pm2 logs tastetask --lines 100

# 清理旧日志
pm2 flush

# 配置日志轮转
pm2 install pm2-logrotate
```

### 2. 性能监控

```bash
# 安装监控工具
pm2 install pm2-monit

# 查看实时监控
pm2 monit
```

### 3. 数据库维护

```bash
# 定期备份数据库
crontab -e
# 添加：0 2 * * * /root/backup.sh

# 清理旧备份
find /root/backups -name "tastetask_*.db" -mtime +30 -delete
```

---

## 🎯 快速部署脚本

我可以帮你创建一个一键部署脚本，需要吗？

这个脚本会自动：
- 安装所有依赖
- 配置PM2
- 设置Nginx
- 配置SSL证书
- 设置自动备份

需要我创建吗？
