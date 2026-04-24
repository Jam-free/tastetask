# Taste-Task 试金石 部署指南

## 本地运行

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化数据库
```bash
node init-db.js
```

### 3. 启动服务器
```bash
npm start
```

访问：http://localhost:3000

## 服务器部署

### 使用 PM2 部署（推荐）

1. **安装 PM2**
```bash
npm install -g pm2
```

2. **启动应用**
```bash
cd /path/to/tastetask
pm2 start server.js --name tastetask
```

3. **设置开机自启**
```bash
pm2 startup
pm2 save
```

4. **常用命令**
```bash
pm2 status           # 查看状态
pm2 logs tastetask   # 查看日志
pm2 restart tastetask # 重启
pm2 stop tastetask    # 停止
```

### 使用 systemd 部署（Linux）

1. **创建服务文件**
```bash
sudo nano /etc/systemd/system/tastetask.service
```

2. **添加以下内容**
```ini
[Unit]
Description=Taste-Task Test Suite
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/tastetask
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. **启动服务**
```bash
sudo systemctl daemon-reload
sudo systemctl enable tastetask
sudo systemctl start tastetask
```

### 使用 Docker 部署

1. **创建 Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. **构建并运行**
```bash
docker build -t tastetask .
docker run -d -p 3000:3000 --name tastetask -v $(pwd)/tastetask.db:/app/tastetask.db tastetask
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

## 环境变量

可以创建 `.env` 文件配置环境变量：

```bash
PORT=3000
NODE_ENV=production
```

## 数据备份

定期备份数据库文件：

```bash
# 手动备份
cp tastetask.db tastetask.db.backup.$(date +%Y%m%d)

# 使用 cron 自动备份
0 2 * * * cp /path/to/tastetask.db /path/to/backup/tastetask.db.$(date +\%Y\%m\%d)
```

## 监控和日志

### PM2 日志
```bash
pm2 logs tastetask --lines 100
```

### 系统日志
```bash
journalctl -u tastetask -f
```

## 故障排查

### 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 数据库锁定
如果遇到 "database is locked" 错误：
```bash
# 删除锁定文件
rm tastetask.db-shm tastetask.db-wal
```

### 权限问题
```bash
# 设置正确的文件权限
chmod 644 tastetask.db
chmod 755 public
```

## 性能优化

1. **启用压缩**：使用 Nginx 的 gzip 压缩
2. **静态文件缓存**：配置浏览器缓存策略
3. **数据库优化**：定期清理旧的收藏记录
4. **负载均衡**：使用 PM2 集群模式

```bash
pm2 start server.js -i max --name tastetask
```

## 安全建议

1. **修改管理员密码**：在 `server.js` 中修改密码
2. **启用 HTTPS**：使用 Let's Encrypt 证书
3. **防火墙配置**：限制数据库文件访问
4. **定期更新**：保持依赖包最新

## 升级指南

1. 备份数据库
2. 拉取最新代码
3. 运行 `npm install`
4. 重启服务
