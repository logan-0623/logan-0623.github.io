#!/bin/bash

# 部署脚本 - 从 dev 文件夹构建并更新静态文件到根目录

echo "🚀 开始构建..."

# 进入 dev 目录
cd dev

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ $? -ne 0 ]; then
  echo "❌ 构建失败！"
  exit 1
fi

echo "✅ 构建成功！"

# 返回根目录
cd ..

# 删除旧的静态文件（保留 dev、jekyll_backup、.git 等）
echo "🗑️  删除旧的静态文件..."
rm -rf assets/ index.html

# 复制新构建的文件到根目录
echo "📋 复制新文件到根目录..."
cp -r dev/dist/* .

echo "✨ 部署完成！"
echo ""
echo "📝 下一步："
echo "   1. 检查更改: git status"
echo "   2. 提交更改: git add -A && git commit -m 'Update site'"
echo "   3. 推送到 GitHub: git push"