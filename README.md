# Zihong Luo's Public Portfolio

A public academic portfolio focused on computer science, machine learning, computer vision, medical image analysis, and data analysis.

## Live Site

Visit: [https://loganluo.github.io/](https://logan-0623.github.io/)

## Tech Stack

The current published pages are static HTML. The original source workflow used React, TypeScript, Vite, and Tailwind CSS.

## Development Workflow

### 本地修改

1. Edit the public static pages in the repository root:
   - `index.html`
   - `academic.html`

2. Install dependencies if you want to run the Vite build check:
   ```bash
   npm install
   ```

3. Run the build check:
   ```bash
   npm run build
   ```

4. The root `index.html` and `academic.html` files are the published site files.


要是想看本地网站
   ```bash
   cd dev
   
   npm run dev
   ```


### 部署更新

提交并推送更改：
   ```bash
   ./deploy.sh
   git status
   git add -A
   git commit -m "Update site"
   git push
   ```

## 文件结构

- `index.html` - public static profile page
- `academic.html` - redirect page for the academic profile URL
- `CS_Zihongluo.pdf` - redacted public CV placeholder
- `favicon.svg` - site icon
- `deploy.sh` - static build check and deployment checklist
