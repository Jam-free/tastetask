# 后端 Dockerfile - Debian 12 自带 OpenSSL 3
FROM node:22-slim

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 生成 Prisma 客户端（运行时生成更可靠）
RUN npx prisma generate

# 暴露端口
EXPOSE 3001

# 启动服务（自动初始化数据库，已存在数据时跳过）
CMD ["sh", "-c", "npx prisma db push && (npx tsx src/seed.ts 2>/dev/null || echo '种子数据已存在，跳过') && npm start"]
