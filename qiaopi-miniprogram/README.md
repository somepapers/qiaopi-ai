# 侨批 AI 代书人 · 微信小程序

这是从原 Vue 网页端独立迁移出的 uni-app（Vue 3 + TypeScript）微信小程序前端工程。

## 已完成

- 首页、AI 写批、范文库与范文详情、文化、展览和关于页面。
- 侨批范文与展览图片已迁入本工程。
- 使用 `uni.request` 对接小程序专用的 JSON 生成响应；网页端仍可保留 SSE 流式生成。
- “先预览传统格式”不依赖后端，方便先在微信开发者工具验收页面与交互。

## 运行

1. 进入本目录后执行 `npm install`。
2. 在 [manifest.json](./src/manifest.json) 中填入微信小程序 AppID。
3. 在 [src/config.ts](./src/config.ts) 设置已部署的 HTTPS 后端地址。
4. 执行 `npm run dev:mp-weixin`，用微信开发者工具打开 `unpackage/dist/dev/mp-weixin`。

## 上线前必做

- 部署更新后的后端，并在微信公众平台把 API 域名配置为合法请求域名；域名必须为 HTTPS。
- 后端密钥只能配置在部署平台环境变量，绝不能放入小程序代码或仓库。
- 补充隐私政策、用户协议、图标以及小程序审核所需资料。
