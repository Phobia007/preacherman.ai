# Shopify 冬季版内容替换指南

本指南说明如何在现有本地复刻中替换内容，同时保留可回溯的原始基准。原站为 [Shopify Editions · Winter 2026](https://www.shopify.com/editions/winter2026)。尚未找到该页面的官方开放许可；当前产物保持 Shopify 及原作者署名，用于本地研究，不代表已获得公开部署授权。

## 先分清源文件与生成文件

以下映射均可由现有构建代码直接定位，标为 **SOURCE**。

| 修改目标 | 优先编辑的源位置 | 生成结果与依据 |
| --- | --- | --- |
| 普通中文文案 | `RECON/translations-first.json`、`RECON/translations-second.json` | 生成页面与 `assets/translations.json`。见 [构建第 6 行](RECON/build-clone.cjs#L6)、[第 78 行](RECON/build-clone.cjs#L78)。 |
| 页面标题和描述 | `RECON/build-clone.cjs` 的对应设置 | 生成 `shopify-winter2026.html`。见 [第 47 行](RECON/build-clone.cjs#L47)。运行时标题还有 [辅助脚本第 12 行](assets/clone-bridge.js#L12)。 |
| 中文排版与局部视觉适配 | `assets/clone.css` | 通过构建注入正式页面，且加入原根组件样式声明。见 [第 50 行](RECON/build-clone.cjs#L50)、[第 59 行](RECON/build-clone.cjs#L59)。 |
| 运行时动态文案与本地表单行为 | `assets/clone-bridge.js` | 动态翻译、锚点修正、元素标识与本地提醒反馈。见 [第 9 行](assets/clone-bridge.js#L9)、[第 27 行](assets/clone-bridge.js#L27)。 |
| 图片、视频、字体、模型与动画 | `assets/reference/`、`assets/vendor/` 及 `RECON/reference-manifest.json` | 按原 URL 与本地文件映射生成引用。见 [构建第 16 行](RECON/build-clone.cjs#L16)。 |
| 运行模块的必要补丁 | `RECON/build-clone.cjs` 中明确的模块改写规则 | 从 `RECON/runtime-source/` 重建 `assets/runtime/`。见 [第 52 行](RECON/build-clone.cjs#L52)。 |
| 本地端口、缓存和路径服务 | `serve.cjs` | 默认端口 8126，响应禁止缓存。见 [第 2 行](serve.cjs#L2)、[第 11 行](serve.cjs#L11)。 |

**SOURCE**：重新构建会覆盖 `shopify-winter2026.html`、`index.html`、`assets/runtime/` 中对应文件、字体 CSS 和运行翻译表。[输出逻辑](RECON/build-clone.cjs#L51)。直接修改这些生成结果适合临时排查；要让修改在下次构建保留，应将其落到上述源位置。

## 替换文字

1. 在两份翻译表中找到完整原文键，只修改右侧中文值。保留左侧英文原字符串及其 NBSP 等字符，以维持可回溯性。
2. 新增翻译时同样使用真实原字符串为键。匹配器会将连续空白归一化，但不会模糊匹配或自行推断漏译。[匹配逻辑](RECON/build-clone.cjs#L8)，**SOURCE**。
3. 原文被链接或强调标签分割时，多个字符串会组成一个句子；联动修改相邻片段，避免中文出现重复介词或语序断裂。[HTML 片段处理](RECON/build-clone.cjs#L10)，**SOURCE**。
4. 保留 Shopify、Sidekick、Shop Pay、B2B、API 名称、技术标识、数值和地区限制的事实含义。营销主张改为自己的内容时，使用自己的真实产品事实。
5. 检查动态弹窗和按钮。静态文案与运行时文案分别由构建器和辅助脚本处理，不能只看初始 HTML。[动态处理](assets/clone-bridge.js#L13)，**SOURCE**。

**PARTIAL**：翻译器不改写图片像素、视频画面、GLB 模型内贴图或 Rive 动画内部封装文字。此类内容需要有权编辑的源素材，不能将网页文字翻译完成等同于媒体内容全部中文化。

## 替换媒体与字体

**SOURCE**：构建清单使用 `url`、`file`、`status` 字段，仅 `status: "ok"` 的条目参与 URL 替换。[清单读取](RECON/build-clone.cjs#L16)。替换某一已有素材时，最稳妥的做法是先找到对应 `file`，再使用相同路径和兼容格式的自有素材；新增文件或改名时，要同步维护清单与引用。

- 图片保持原比例、裁切方向和透明背景需求。页面依靠原布局裁切，比例改变可能造成主体被截断。
- 视频保留可播放编码；本地服务器已有 `.mp4`、`.webm` 类型与 Range 支持。[媒体响应](serve.cjs#L3)、[Range 处理](serve.cjs#L12)，**SOURCE**。
- GLB、KTX2、Rive 和相关场景 JSON 视为成套资源。替换模型或动画时同时核对节点名称、材质、状态机、artboard 和外部图像绑定；原组件会按这些接口访问素材。[Hero 场景入口](RECON/runtime-source/HeroScene-BSrKcflv.js#L1)、[Rive 绑定](RECON/runtime-source/RiveInner-BZXVDs83.js#L1)，**SOURCE**。
- 更换字体前确认字体许可与中文字形覆盖。原字体样式由 `fonts-latin-CzfLCQn_.css` 生成，不要只覆盖生成的 `assets/fonts/fonts.css` 而忽略重建过程。[字体生成](RECON/build-clone.cjs#L75)，**SOURCE**。

## 替换品牌视觉

**SOURCE**：`assets/clone.css` 只定义中文适配和辅助 UI 的六个 token，并不承包原版所有场景颜色。原版视觉还分布于 Tailwind 样式、组件、灯光、纹理和场景数据。[适配 token](assets/clone.css#L2)、[Hero 灯光配置](RECON/runtime-source/HeroScene-BSrKcflv.js#L1)。因此换掉 `--accent` 不会自动给所有三维场景换色。

如果改为自己的品牌，应成套处理名称、Logo、标题、配色、照片、场景素材、浏览器图标与分享元信息。保持原基准不变，将有意的视觉变更写成可重复的构建补丁；不要靠调亮度、速度或物体位置掩盖素材缺失与加载错误。

**SOURCE**：正式页面仍包含原站 canonical、语言版本链接与分享元信息，初始 HTML 相关内容位于 [正式页面第 1 行](shopify-winter2026.html#L1)。品牌迁移时要逐项审查，不能只替换屏幕上可见的主标题。

## 替换行为与外部链接

**SOURCE**：当前含邮箱的提醒表单是本地演示：校验后将邮箱保存到 `localStorage` 的 `shopify-winter2026-notify`，并显示不会发送邮件的提示。[表单逻辑](assets/clone-bridge.js#L27)。接入真实订阅服务时，应明确替换这一逻辑、成功与失败状态、数据用途说明，以及重复提交控制，避免同时保留本地拦截和真实提交。

**SOURCE**：当前辅助脚本仅修正冬季版页自身的部分锚点链接，不会把 Shopify 注册、后台、开发文档等外部产品页面变成本地功能。[链接处理范围](assets/clone-bridge.js#L20)。转为自有站点时逐一配置真实目标；没有对应能力的入口应明确呈现可用范围。

## 重建与复核

在项目根目录运行：

```powershell
node RECON/build-clone.cjs
node serve.cjs
```

打开 `http://127.0.0.1:8126/shopify-winter2026.html`。若本地服务已在运行，仅重建文件并刷新即可；服务正常文件响应带 `no-store`，无需保留旧缓存。[服务实现](serve.cjs#L11)，**SOURCE**。

每次内容替换后按此次改动范围检查：

1. 首屏、各章节和移动端没有换行溢出、遮挡或缺图。
2. 控制台没有新的 JavaScript、WebGL 或 WASM 错误；网络面板没有新增本地 404。
3. 搜索、章节跳转、弹窗、视频与涉及的动画状态可用；真实拖动必须实际验证。
4. 所有新增素材都使用本地引用；动态解码器和运行时请求也纳入检查。
5. 桌面快捷方式仍指向当前项目启动脚本，工作目录正确，当前响应保持 `Cache-Control: no-store`。
6. 更新 `NOTES.md`、对照证据与审计结论，明确已验证和未验证范围。

这些是后续替换的复核步骤，不表示本文已执行全部检查。运行报告中的旧错误需要对应到记录时间及后续修复，不能把阶段快照直接当成当前结果。
