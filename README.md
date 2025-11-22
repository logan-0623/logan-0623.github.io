# Zihong Luo's Portfolio

A modern, interactive portfolio website showcasing my research and projects in Embodied Intelligence and Robotics.

## Live Site

Visit: [https://loganluo.github.io/Loganweb/](https://loganluo.github.io/Loganweb/)

## Tech Stack

Built with React, TypeScript, and Vite. Styled with Tailwind CSS.

## Development Workflow

### 本地开发

1. 进入开发目录：
   ```bash
   cd dev
   ```

2. 安装依赖（首次）：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 在浏览器中打开 `http://localhost:3000`

### 部署更新

当你在 `dev/` 文件夹中完成源代码优化后：

1. 回到根目录：
   ```bash
   cd ..
   ```

2. 运行部署脚本：
   ```bash
   ./deploy.sh
   ```

3. 提交并推送更改：
   ```bash
   git add -A
   git commit -m "Update site"
   git push
   ```

部署脚本会自动：
- 构建项目（`npm run build`）
- 删除旧的静态文件
- 复制新构建的文件到根目录

## 文件结构

- `dev/` - 源代码（React/TypeScript，不在 Git 中）
- `assets/` - 构建后的静态资源
- `index.html` - 构建后的入口文件
- `jekyll_backup/` - 旧的 Jekyll 网站备份
- `deploy.sh` - 自动化部署脚本
