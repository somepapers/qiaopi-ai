# Vue 3 + TypeScript + Vite

## 本机部署

在项目根目录运行 `npm run build`，再运行 `npm run start:local`。打开 `http://127.0.0.1:4173/exhibition` 即可浏览本机馆藏。首次在新电脑部署时先执行 `npm ci` 和 `npm ci --prefix server`。此模式只监听本机回环地址，浏览内置展品无需团队口令或云存储。

新增本地原图后，依次运行 `npm run compress:exhibition` 和 `npm run build`，再刷新页面。重启电脑后只需在项目根目录运行 `npm run start:local`。

## 展览馆上架

在现有 Vercel 项目中绑定 **Public Vercel Blob** 和支持 Redis 命令的 KV 数据库。为运行环境配置下列服务端变量，部署后打开 `/exhibition/admin`。请勿给这些变量添加 `VITE_` 前缀。

| 变量 | 用途 |
| --- | --- |
| `EXHIBITION_ADMIN_PASSWORD` | 团队自定的高强度共用管理口令 |
| `BLOB_READ_WRITE_TOKEN` | 展览馆 Blob 存储的读写令牌 |
| `KV_REST_API_URL`、`KV_REST_API_TOKEN` | 现有 KV 的 REST 地址与读写令牌 |

本地开发把上述变量放在 `server/.env`。在 `server` 目录安装依赖并运行 `npm run dev`，在项目根目录安装依赖并运行 `npm run dev`。前端通过同源代理访问后台。开发和验收请使用独立的 Blob 与 KV 测试资源。

登录后选择展区和单帧 JPG、PNG 或 WebP，填写展签并发布。单张上限 20 MiB、5000 万像素。成功页面的「查看展品」链接可以直接分享。后台会话有效期为 8 小时，连续 5 次口令错误后需等 15 分钟。上传中断时在当前表单重试会沿用相同的作品编号。

侨批档案与团队 IP 作品随站点提供。原图放入 `侨批展示库/` 或 `IP素材库/` 后运行 `npm run compress:exhibition` 更新内置版本，并将生成的 WebP 文件和展签一同提交。网页后台发布的作品直接写入存储，刷新即可查看。

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
