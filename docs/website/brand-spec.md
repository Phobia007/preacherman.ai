# Shopify Winter 2026 · 视觉规范

来源：https://www.shopify.com/editions/winter2026

原版绘画与 WebGL 场景铺满背景，细线框和紧凑目录组织导航，NeueMontreal 与 HWCigars 形成标题和叙事层次。

| 令牌 | 原站源值 | 等值 OKLch |
|---|---|---|
| --bg | #000000 | oklch(0.000% 0.00000 0.00) |
| --surface | #292919 | oklch(27.594% 0.02755 108.08) |
| --fg | #f7f7ee | oklch(97.368% 0.01187 106.62) |
| --muted | #909083 | oklch(64.954% 0.01885 106.91) |
| --border | #ffffff | oklch(100.000% 0.00000 89.88) |
| --accent | #8051ff | oklch(58.734% 0.24235 289.10) |

颜色直接来自 assets/runtime/tailwind-G-N6aznT.css 的 bg-dark、text-light、text-grey-mid、text-sidekick-base 规则与原站 computed palette；新增令牌只用于本地适配样式，原站多章节配色全部保留。

- 标题：NeueMontreal, Microsoft YaHei, sans-serif。
- 叙事：HWCigars, Microsoft YaHei, serif；装饰：ImperialScript。
- 导航：Inter-Variable, Helvetica, Microsoft YaHei, sans-serif。
- 等宽：ui-monospace, Consolas, monospace（原站系统等宽栈）。
- 原版四种西文字体自托管；中文使用设备中文字体补足原字体缺少的汉字。

1. 保留真实人物、商品、艺术画面与原版滚动场景，避免重新绘制近似图。
2. 首屏目录保持中央细线框；进入章节后迁移到左侧。
3. 保留黑白导航、章节独立强调色与原版自适应断点。
4. 中文标题使用可访问文本替换英文 SVG 字形；素材内文字保留原图。
5. 使用原版 Lenis、Three 与 Rive，遵循原有点击和滚动驱动机制。
