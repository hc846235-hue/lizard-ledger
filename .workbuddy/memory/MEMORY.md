# MEMORY.md

- 2026-04-02：lizard-ledger 配置了按小时运行的自动部署任务；自动提交时应只包含实质性项目代码或文档变更，排除 `.codebuddy/automations/lizard-ledger/memory.md` 等自动化记录文件；提交信息格式使用 `Auto commit: 更新部署 - YYYY-MM-DD HH:mm:ss`，随后推送到 `origin/main` 触发 GitHub Actions / GitHub Pages 部署。
