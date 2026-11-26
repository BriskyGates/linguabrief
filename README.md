<div align="center">

# 🌍 LinguaBrief

**跨语种 Telegram 社群精华晚报 + 随叫随到翻译官（极简开源版）**

*Noise-Free AI Group Digest & 16-Language Instant Translator on Cloudflare Workers + D1*

<br/>

<a href="https://t.me/LinguaBriefBot?start=github">
  <img src="https://img.shields.io/badge/%E2%9A%A1%EF%B8%8F_%E7%82%B9%E5%87%BB%E4%B8%80%E9%94%AE%E5%90%AF%E7%94%A8%E5%AE%98%E6%96%B9%E5%85%8D%E9%83%A8%E7%BD%B2%E7%89%88-@LinguaBriefBot-2AABEE?style=for-the-badge&logo=telegram&logoColor=white" alt="点击一键启用官方免部署版" height="52" />
</a>

<h2>👉 <a href="https://t.me/LinguaBriefBot?start=github">点击一键启用官方免部署版（@LinguaBriefBot）</a></h2>

**无需服务器 · 无需自备 OpenAI Key · 拉群即享 16 国语言每日晚报与 `/tr` 即时互译**

</div>

---

## ✨ 核心特性

- **🧹 净水精华晚报（`/digest` + 每日定时推送）**：自动过滤砍价拉新链、表情复读机与水贴；基于回复树热度和双人互喷折叠算法提纯干货，按各群专属时区准点推送带 **「↗原楼层跳转」** 的结构化晚报。
- **🌐 16 国语言 + 中英双语（`/lang`）**：支持简体中文、🌍 中英双语、English、Русский、Español、Português、日本語、한국어、العربية、Tiếng Việt、Indonesia、ภาษาไทย、Türkçe、Deutsch、Français、繁體中文。
- **💬 千人千面母语即译（`/tr`）**：群内回复任意消息发送 `/tr`，自动翻译为**提问者自己的 Telegram 客户端母语**；也支持 `/tr ru`、`/tr es`、`/tr ja` 等指定目标语种。
- **⚡️ 内联 5 国译文卡片**：在任意聊天框输入 `@YourBot 句子`，一次弹出 5 种高频语言地道译文卡片，点击即发。
- **🪶 零成本边缘部署**：纯原生 JS，零第三方运行时依赖，直接托管在 **Cloudflare Workers + D1 SQLite** 免费额度内。

---

## 🤖 指令速查

| 指令 | 作用 |
| --- | --- |
| `/digest` | 立即生成本群今日精华晚报 |
| `/tr` | 回复任意消息自动翻成你的母语（支持 `/tr en`、`/tr ru` 等） |
| `/lang` | 弹出 16 国语言与「中英双语」切换面板（管理员） |
| `/tz +8 21` | 设置本群时区与每日自动推报整点（管理员） |
| `/groupid` | 查看本群 ID 与当前晚报语言、时区配置 |

---

## 🚀 5 分钟自部署教程（Cloudflare Workers + D1）

> 想省事可直接点击上方按钮使用 [**官方免部署版 `@LinguaBriefBot`**](https://t.me/LinguaBriefBot?start=github)；如需私有化部署，按以下 5 步即可上线：

### 1. 克隆并安装依赖

```bash
git clone https://github.com/BriskyGates/linguabrief.git
cd linguabrief
npm install
npx wrangler login
```

### 2. 创建 D1 数据库并初始化表结构

```bash
npx wrangler d1 create lingua_brief_db
```

将命令返回的 `database_id` 填入 `wrangler.jsonc`，然后初始化表结构：

```bash
npm run db:init
```

### 3. 配置环境变量（Secrets）

在 [@BotFather](https://t.me/BotFather) 创建机器人并拿到 `BOT_TOKEN`（如需内联模式，在 BotFather 开启 **Inline Mode**）：

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put OPENAI_KEY
```

*(可选)* 如果使用兼容 OpenAI 接口的第三方模型网关，可在 `wrangler.jsonc` 的 `vars` 中配置 `OPENAI_BASE_URL`。

### 4. 部署并绑定 Webhook

```bash
npm run deploy
```

部署成功后，在浏览器访问以下两个地址完成 Webhook 绑定与多语言菜单配置（将 `<BOT_TOKEN_PREFIX>` 替换为 `BOT_TOKEN` 的前 10 位字符）：

1. 绑定 Webhook：`https://<your-worker>.workers.dev/setup-webhook?key=<BOT_TOKEN_PREFIX>`
2. 初始化 4 语种菜单与简介：`https://<your-worker>.workers.dev/setup-profile?key=<BOT_TOKEN_PREFIX>`

---

## 📄 License

[MIT](./LICENSE)
