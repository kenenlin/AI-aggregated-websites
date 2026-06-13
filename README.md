# 聚合AI工坊

自带 API Key 的 AI 工具箱聚合网站。MVP 支持用户注册登录、厂商 API Key 加密保存、工具模板执行、模型选择和历史记录。

## 技术栈

- Next.js App Router + React + TypeScript
- Tailwind CSS + shadcn 风格组件 + lucide-react
- Auth.js / NextAuth Credentials 登录
- Prisma + PostgreSQL
- AES-256-GCM 加密用户 API Key
- Vitest 单元测试

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 创建 `.env`，参考 `.env.example` 填写：

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_toolbox_hub?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
API_KEY_ENCRYPTION_SECRET="replace-with-32-byte-minimum-random-secret"
```

3. 初始化数据库：

```bash
npx prisma db push
```

如果本机没有 PostgreSQL，可以用 Docker 启动开发数据库：

```bash
docker compose up -d
npx prisma db push
```

4. 启动开发服务器：

```bash
npm run dev
```

## 常用命令

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 已接入的厂商适配

- OpenAI
- Anthropic
- Google Gemini
- DeepSeek
- 通义千问
- 智谱 GLM
- Moonshot / Kimi
- 硅基流动
