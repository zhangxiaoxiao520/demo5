# 绿色生活助手 (GreenLife Helper)

一个专注于可持续生活方式的社区平台，记录、分享、发现环保生活技巧。

## 功能特点

- 🌱 **环保社区** - 分享和发现环保生活技巧
- 🤖 **AI助手** - 专业环保专家提供建议和内容创作
- 📱 **响应式设计** - 支持桌面和移动设备
- 🔐 **用户认证** - 支持邮箱注册和Google登录
- 💬 **互动功能** - 点赞、评论、收藏、分享
- 📊 **数据统计** - 用户活跃度和环保影响力统计

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Supabase (PostgreSQL, Auth, Storage)
- **AI服务**: DeepSeek API
- **部署**: Vercel, CloudStudio

## 快速开始

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.local.example .env.local
```

2. 配置环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DEEPSEEK_API_KEY=your_deepseek_api_key (可选)
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
greenlife-helper/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── auth/              # 认证页面
│   ├── explore/           # 探索页面
│   ├── create/            # 创建页面
│   ├── profile/           # 个人资料
│   ├── ai-assistant/      # AI助手
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── lib/                   # 工具库
│   └── supabase.ts        # Supabase客户端
├── public/               # 静态资源
└── seed-database.js       # 数据库种子数据
```

## Supabase 数据库结构

主要数据表：

- `profiles` - 用户资料
- `posts` - 帖子内容
- `categories` - 分类信息
- `comments` - 评论
- `likes` - 点赞记录
- `bookmarks` - 收藏记录

## 部署

### Vercel 部署

1. Fork 此仓库
2. 在 Vercel 中连接 GitHub 仓库
3. 配置环境变量
4. 自动部署

### CloudStudio 部署

1. 构建项目：`npm run build`
2. 将 `out` 目录部署到 CloudStudio

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 邮箱: contact@greenlife.com
- 项目地址: [GitHub Repository](https://github.com/your-repo/greenlife-helper)

---

让环保生活更简单！ 🌍💚