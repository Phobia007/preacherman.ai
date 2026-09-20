# Shopify 2026 冬季版 · 复刻说明

## 交付与启动

- 正式页面：`shopify-winter2026.html`；`index.html` 为预览入口。
- 双击桌面「Shopify 2026 冬季版」启动当前项目。
- 手动：在项目目录运行 `node serve.cjs`，打开 http://127.0.0.1:8126/shopify-winter2026.html 。
- 服务监听本机回环地址，所有资源返回 `Cache-Control: no-store, max-age=0`。
- 使用 HTTP 或 Open Design 预览打开；模块、WASM 和数据加载不支持直接用 file:// 打开。

## 来源与范围

原站：https://www.shopify.com/editions/winter2026 。品牌与内容归 Shopify 及相关权利人所有。已检索公开仓库，未找到此页面的官方开放许可源码仓库；采用真实部署的 HTML、JavaScript、CSS 与媒体作为依据。

复杂度 L5，模式为忠实复刻并按项目要求中文化。技术包括 React/Remix、Three.js、GLB/KTX2、Rive 和 Lenis。原始基准保存在 `RECON/index-original.html`、`RECON/runtime-source/`。

范围为指定 Winter 2026 单页的 12 个章节、导航、搜索、菜单、滚动和视频入口。外部帮助中心、注册、商店后台、支付与其他 Editions 不在复刻范围内。

## 实际实现

保留原版组件、样式、模型、场景及动画代码；794 项引用媒体、57 个部署模块已落地。NeueMontreal、HWCigars、ImperialScript 等原站字体自托管，中文由系统中文字体补足缺失字形。颜色取自真实 CSS 与计算值。

本地改写资源、解码器和 WASM 地址及 Remix 路由；原组件通过 createRoot 重新挂载本地数据。因此不是逐字节镜像。610 条翻译映射覆盖正文、导航和状态文案。搜索查询当前页内容索引，不调用官方搜索后台。提醒表单仅保存设备偏好，明确提示不会发送邮件。

| 模块 | 本地表现 | 差异与边界 |
|---|---|---|
| 首屏与 3D | 原图、模型、材质、场景 | 动态截帧时间不同 |
| 12 章长页 | 原组件、顺序和媒体 | 中文改变文案长度和页面高度 |
| 滚动与导航 | 原版 Lenis、场景逻辑 | 未覆盖所有 GPU |
| 搜索 | 中文、本地建议和结果 | 不模拟官方排序，只覆盖当前页 |
| 视频 | 官方 YouTube 弹层 | 需要联网，画面内原文保留 |
| 移动端 | 原响应式布局、折叠菜单 | 中文标题和按钮必要适配 |
| 外部链接 | 保留官方目标 | 离开本地复刻范围 |

## 验收

- 1440、768、390 三档：12 个主章节、2 个 canvas，无横向溢出、JS/console 错误或失败响应。证据：`RECON/final-validation.json`。
- 原/本地均为 80 个 section、292 个链接、345 个图片、65 个按钮；计数不等于全部功能证明。
- 12 章导航、中文搜索、移动菜单已验证。视频见 `RECON/screenshots/clone-video.png`。
- 字体、图片、颜色 strict 审计通过；详见 `CLONE_AUDIT.md`。
- 预览根资源改写检查完成，0 项待改写。
- 桌面快捷方式目标、工作目录及禁用缓存已验证。

| 人工维度 | 分数 | 依据或限制 |
|---|---:|---|
| 源证据 | 5/5 | 真实部署源码、完整资源清单 |
| 结构 | 5/5 | 12 章与原组件结构保留 |
| 视觉 | 4/5 | 原素材与样式；中文和动态画面有差异 |
| 交互 | 4/5 | 主路径通过；未穷举所有控件状态 |
| 响应式 | 4/5 | 三档实测；未覆盖所有浏览器 |
| 中文内容 | 4/5 | 文案与控件翻译；媒体内原文保留 |
| 范围内功能 | 4/5 | 展示与本地搜索可用；不复制后台 |

1440×900 首屏像素差异率 13.87%，自动视觉分 3/5。包含翻译和动画时间差，不应换算成“86% 还原度”。

## 修改地图

- 文案：`RECON/translations-first.json`、`RECON/translations-second.json` 和构建脚本补充字典。之后运行 `node RECON/build-clone.cjs`。
- 中文排版：`assets/clone.css`；适配交互：`assets/clone-bridge.js`。
- 媒体：`assets/reference/`；映射：`RECON/reference-manifest.json`；解码器：`assets/vendor/`。
- 字体：`assets/fonts/fonts.css`；颜色依据：`brand-spec.md`。
- 详细替换：`REPLACE_GUIDE.md`；技术与源码定位：`TEARDOWN.md`。

## 部署前须替换清单

本次作为本地复刻研究交付，未公开部署。未发现页面整体开放再发布许可，不能将可访问部署资源视为 MIT 授权。公开使用前需核实图片、字体、视频、模型与品牌授权，替换自有品牌、注册/法律链接、联系入口和业务服务。

## 验证边界

合成 hover/click/canvas 探针只证明状态变化，不证明所有人工拖拽体验。未验证所有辅助技术、弱网、低端 GPU、跨浏览器和地区视频限制。第一次侦察的 favicon 404 已修复，最终三档错误数为 0。

