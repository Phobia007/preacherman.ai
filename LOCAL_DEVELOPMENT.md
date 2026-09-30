# 在这台 Mac 上编辑和运行

完整版本分支：`codex/complete-web-experience`，原始提交 `3ecbdeefe0820bf2236090122691feaab8a5d32f`。

## 启动

在项目根目录运行：

```sh
npm run local
```

- 展示官网：http://127.0.0.1:8128/
- 浏览器应用：http://127.0.0.1:5174/
- 本机 API：127.0.0.1:8791，仅用于本地预览。

`Try It` 自动跳转至本机浏览器应用。5174 用于避开本机另一项目占用的 5173。启动前检查端口，冲突时退出；不会停止其他项目。一个前台 Node 管理进程拥有两个预览子进程。在启动终端按 Ctrl+C 会同时停止官网、应用和 API。关闭后重新运行上述命令即可。

桌面 `preacherman.ai.app` 调用项目内的 `scripts/open-local.mjs`，健康服务会直接复用。Apple 芯片 Mac 上若 Finder 以 Rosetta 启动 Node，启动脚本会自动切回 arm64，保持与已安装依赖的架构一致。启动失败会及时显示当前日志中的具体错误。

桌面后台服务的主管进程 PID 保存在 `browser/.runtime-tmp/desktop-preview.pid`，启动日志为同目录的 `desktop-preview.log`。需要停止时，先核对该 PID 的命令行为本项目的 `scripts/local.mjs`，再对该 PID 发送 SIGTERM；它会关闭官网、浏览器预览及 API。不要按进程名批量结束 Node。

## Mac 与 Windows 启动

两种系统均使用 Node.js 22.12 或更高版本。在对应系统上运行依赖安装与构建命令，不要在 Mac 和 Windows 之间复制 `node_modules`（Rollup 等依赖包含系统和 CPU 专用文件）。

- 通用启动：`npm run open`，复用健康服务并打开本机官网。
- Mac：继续双击桌面的 `preacherman.ai.app`；项目内也提供 `scripts/start-local.command`。
- Windows：双击 `scripts/start-local.cmd`，或为它创建桌面快捷方式。网址及错误报告通过 Windows 默认应用打开。
- `npm run local` 为两种系统提供前台模式，在该终端按 Ctrl+C 停止所有预览服务。
- `npm run test:launcher` 检查平台启动命令；Apple 芯片 Mac 还会复现 Rosetta 启动并验证自动纠正。Windows 真机验收仍需在 Windows 上执行启动检查及页面检查。

## 编辑位置

- 官网页面与素材：`public/`；原始设计说明：`docs/website/`。
- 浏览器应用：`browser/apps/preacherman-demo-host/src/`。
- 浏览器内部组件：`browser/packages/`。

修改官网后，停止并重启 `npm run local`，会重新生成官网。修改浏览器应用后，先停止预览，执行 `npm run browser:build`，再运行 `npm run local`。浏览器应用已完成首次依赖安装和构建。

重新安装依赖时：

```sh
npm ci
npm run browser:setup
npm run browser:build
```

## 正式发布

目前这套启动命令用于本机开发。GitHub `main` 仍是正式域名的生产分支。上线完整体验还需要确定浏览器应用的公共地址、独立托管与受认证的公共 API，再设置官网构建变量 `PREACHERMAN_WEB_URL`。本地预览 API 不能直接暴露给公共用户。

GitHub 的 Git 传输在本机超时，因此首次下载使用官方归档通道；所有 3635 个源码和资源文件、目录树及原始提交均以 GitHub 提供的 SHA-1 校验恢复。当前仓库保留原始提交和远程分支，历史为浅克隆形式。后续 Git 拉取或推送仍需要本机能够连接 `github.com`。

## 本次验证与待办（2026-09-22）

- 浏览器应用 TypeScript 检查及生产构建通过；官网构建与 Wrangler 部署预检查通过。
- 官网画面可打开；Try It 在当前标签进入本机应用；Home 3D 人物可见；本机 API 健康检查正常。
- AI / ASR / TTS 尚未配置，健康检查中对应配置状态为 false；未验证外部模型调用或登录。
- 浏览器控制台发现 Gallery 点云脚本 `AntimatterAttribute` 的 undefined.length 错误；另有导入说明已记录的 hydration mismatch。此次未改动相关 UI 和素材代码。
- Settings 的 Appearance 页面未提供可操作的主题选项，因此此次未完成两个外观模式的完整验证。

当前预览为本机编辑入口，尚未将完整分支发布到正式域名。
