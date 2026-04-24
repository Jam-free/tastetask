#!/bin/bash

echo "🚀 Taste-Task 试金石 - 快速启动脚本"
echo "======================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未安装 Node.js，请先安装 https://nodejs.org/"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未安装 npm"
    exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 初始化数据库
if [ ! -f "tastetask.db" ]; then
    echo "🗄️  初始化数据库..."
    node init-db.js
fi

# 启动服务器
echo ""
echo "✅ 启动服务器..."
echo "📍 访问地址: http://localhost:3000"
echo "🔑 管理员密码: shijinshi1994"
echo ""
npm start
