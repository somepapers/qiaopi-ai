# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作提供指导。

## 项目概述

侨批AI代书人 — 一个 Web 应用，用户输入日常口语，AI 自动生成符合传统侨批（银信）格式的古典家书。侨批是海外华侨寄回家乡的历史书信（1820s-1970s），2013年入选联合国教科文组织《世界记忆名录》。项目部署在 Vercel 上，前端（Vue 3 SPA）和后端（Serverless 函数）统一管理。

**线上地址**：`https://qiaopi-ai-krc9.vercel.app`（自定义域名 `qiaopi-ai-krc9.cn`）

## 常用命令

```bash
# 前端开发（端口 5173，/api 代理到 Express 后端）
npm run dev

# 前端生产构建 + 类型检查
npm run build

# 仅类型检查
npx vue-tsc -b --noEmit

# 展览馆图片压缩：素材库原图 → src/assets/exhibition/（幂等，--force 强制重压）
npm run compress:exhibition

# 本地后端开发（端口 3001，从 .env 读取 CHATBOX_API_KEY）
cd server && npx tsx index.ts

# 部署：推送到 master 分支 → Vercel 自动部署
git push
```

## 架构

```
用户浏览器 → Vite SPA (Vue 3 + TailwindCSS v4)
                   │ POST /api/generate（SSE 流式传输）
                   ▼
           api/generate.ts（Vercel Serverless 函数）
                   │ 携带 CHATBOX_API_KEY 请求
                   ▼
          Chatbox AI API (ai.chatboxai.app/v1，兼容 OpenAI 接口)
```

**关键架构决策：**
- **生产环境无需独立后端服务器**：Express 服务器（`server/`）仅供本地开发使用。生产环境使用 `api/generate.ts`，一个代理到 Chatbox AI 的 Vercel Serverless 函数，支持 SSE 流式传输。
- **字体**：通过 jsDelivr CDN 加载「鸿雷板书简体」毛笔书法字体，在 `src/styles/main.css` 中定义为 `--font-calligraphy` 变量。仅应用于 `.vintage-text` 元素（书信内容），不影响通用 UI。
- **Vite 开发代理**：`vite.config.ts` 中将 `/api/*` 转发到 `localhost:3001`，用于本地开发。

## 关键文件

| 文件 | 用途 |
|------|------|
| `api/generate.ts` | **生产环境 AI 后端** — 系统提示词 + 用户消息构建 + SSE 代理转发到 Chatbox AI。包含按关系分类的敬语指南和侨批格式系统提示词。 |
| `api/stats.ts` | **网站使用次数统计** — GET 读取 / POST 进入网站 +1，Vercel KV key `qiaopi:visits`，首次访问自动初始化基线 10032。前端由 `App.vue` 挂载时计数、首页展示。 |
| `server/prompts/system-prompt.ts` | **仅开发环境**使用的系统提示词版本（供 Express 服务器使用）。必须与 `api/generate.ts` 保持同步。 |
| `src/utils/constants.ts` | `HONORIFIC_MAP`（16 种关系 → 称谓/祝颂/落款映射）、`SCENARIO_METADATA`（场景分类）、`RELATIONSHIP_LABELS`（关系标签）、`CHATBOX_CONFIG`（API 配置） |
| `src/utils/templateData.ts` | 12 篇预制侨批范文模板，含结构解析（标注哪些部分是固定格式、哪些可变） |
| `src/components/letter/LetterExport.vue` | 基于 Canvas 的图片导出 — 在复古纸张纹理上渲染侨批文字，支持横排/竖排，包含墨色和做旧效果 |
| `src/stores/letter.ts` | Pinia 状态管理，控制书信生成全生命周期：输入 → 流式生成 → 编辑 → 导出，数据持久化到 localStorage |
| `src/assets/exhibition/index.ts` | **展览馆图片数据层** — `import.meta.glob` 自动发现 `qiaopi/`、`ip/` 目录图片，与 `src/utils/exhibitionMeta.ts` 的标题映射合并 |
| `src/components/exhibition/PhotoGrid.vue`、`Lightbox.vue` | 展览馆图片网格（骨架微光 + 懒加载 + 固定比例盒防 CLS）与灯箱（键盘切换、邻图预加载） |

## 提示词工程经验

AI 生成质量高度依赖 `api/generate.ts` 中的系统提示词设计。核心经验：
- **内容保真度优先**：提示词必须明确要求 AI 忠实复现用户输入，而非仅遵循格式规则。缺少此项会导致 AI 生成千篇一律的模板内容。
- **用户消息结构很重要**：将用户的 `plainSpeech`（口语内容）放在用户消息的**最顶部**，用视觉标记（`===`）包裹，而不是埋在元数据字段后面。
- **系统提示词保持精简**：约 500 字的效果远好于约 1700 字。过长的格式指令会压倒用户内容，占据模型注意力。
- 模型：通过 Chatbox AI 调用 `deepseek-v3.2`（兼容 OpenAI 接口）。Temperature 设为 0.5。

## 图片导出

`LetterExport.vue` 中的 Canvas 2D API 渲染：
- 3 种纸张纹理（素笺/旧纸/毛边），模拟纤维纹理线和暗角效果
- 横排：标准从左到右渲染，支持自动换行
- 竖排：文字从上到下逐字绘制，列从右到左排列
- Canvas 渲染前必须预加载字体：`document.fonts.load()`
- 导出尺寸：宽度固定（横排 1080 / 竖排 1920），高度随内容伸缩——横排最短 540、超长时向下加长（超出 canvas 上限自动缩小字号）；竖排基准 1080、超长时向下加长

## 展览馆图片工作流

展览馆（`/exhibition`）分「侨批文化展示」「团队IP设计」两个 Tab 区域（`?tab=` 查询参数切换）。图片**永不直接放 `public/`**（vercel.json 对 public 路径返回 no-store，每次访问都强制重新下载）。

**团队新增图片流程**：
1. 原图放入素材库目录：侨批区 → 根目录 `侨批展示库/`，IP 区 → 根目录 `IP素材库/`
2. 运行 `npm run compress:exhibition`：压缩（最长边 1600，jpg q80 / png palette 量化）并输出到 `src/assets/exhibition/qiaopi/` 或 `ip/`
3. 提交压缩产物 → 推送部署。图片构建时带内容哈希进入 `dist/assets/`，命中 vercel.json 的 immutable 一年缓存

放图即自动出现在页面上（`import.meta.glob` 自动发现，零代码改动）；想改标题/说明/排序，编辑 `src/utils/exhibitionMeta.ts` 的映射表（文件名索引）。IP 素材目录为空时页面显示印章风「作品整理中」占位。

## 网络说明

开发者位于中国境内。GitHub 和 Vercel 域名在不使用 VPN 时会被屏蔽。推送前确认 VPN 模式（2026-11 实测：**全局模式直连可用**，git 代理已从全局配置移除）：

- **VPN 全局模式（TUN/系统代理）**：无需 git 代理，直接 `git push`
- **本地 HTTP 代理模式**（Clash 类，端口 7890）：先执行

```bash
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890
```
## 注意事项
在之后的对话中请将你的思考和输出内容用中文的形式输出。