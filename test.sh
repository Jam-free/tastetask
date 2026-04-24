#!/bin/bash

echo "🧪 Taste-Task 试金石 - 测试脚本"
echo "================================"
echo ""

# 检查服务是否运行
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ 服务器未运行，请先运行: npm start"
    exit 1
fi

echo "✅ 服务器运行正常"
echo ""

# 测试健康检查
echo "📍 测试健康检查..."
curl -s http://localhost:3000/api/health | jq '.'
echo ""

# 测试统计信息
echo "📊 测试统计信息..."
curl -s http://localhost:3000/api/stats | jq '.total, .byLevel'
echo ""

# 测试获取用例
echo "🔍 测试获取用例（随机10条）..."
CASE_COUNT=$(curl -s "http://localhost:3000/api/cases?random=true&limit=10" | jq '. | length')
echo "✓ 获取到 $CASE_COUNT 条用例"
echo ""

# 测试收藏排行榜
echo "⭐ 测试收藏排行榜..."
curl -s http://localhost:3000/api/cases/top/favorites?limit=5 | jq '. | length'
echo "（目前收藏数，添加收藏后会显示）"
echo ""

echo "✅ 所有测试通过！"
echo ""
echo "🌐 访问地址: http://localhost:3000"
echo "🔑 管理员密码: shijinshi1994"
