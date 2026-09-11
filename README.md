# RMT 文档站

基于 Docusaurus 3，存放 RMT 各版本的帮助文档。

## 常用命令

```bash
npm run start        # 本地开发，改动实时生效
npm run build        # 构建到 build/
npm run serve        # 预览构建结果
npm run docs:version 1.3.0   # 把当前 docs/ 快照为新版本
```

## 文档放哪

| 目录 | 用途 |
| --- | --- |
| `docs/` | 最新版（跟随开发，版本下拉里显示为「最新版」） |
| `versioned_docs/version-1.2.2/` | v1.2.2 快照 |
| `versioned_docs/version-1.1.2/` | v1.1.2 快照 |

分组用英文目录名（URL 干净），中文名写在组目录的 `_category_.json` 里：

```
docs/
  intro.mdx            首页
  guide/               软件介绍
  quickstart/          快速上手
  commands/            指令手册
  faq/                 常见问题
  errors/              常见报错
  changelog/           更新日志
  dev/                 开发指南
```

图片按版本放在 `static/img/latest/`、`static/img/1.2.2/`、`static/img/1.1.2/`，
正文里写 `/img/latest/MacroCMD/Key.png` 这种绝对路径。

往这些目录里丢 `.md` / `.mdx` 就会自动进侧边栏，不用改 `sidebars.ts`。
篇内用 front matter 控制排序与标题：

```md
---
title: 搜索图片
sidebar_position: 3
---
```

## 从发布包的 `Web/` 目录导入

新版本发布后，把发布包里的 `Web/`（里面是 `软件介绍.md`、`指令手册.md` 这类文件和 `Images/`）
整个拷到 `versioned_docs/version-<版本号>/Web/`，然后：

```bash
node scripts/convert-web.mjs
```

脚本会按 `## 章节` 拆成独立页面、把 `Images/` 拷到 `static/img/<版本>/`、
把正文里的 `/RMT/Web/Images/` 改成 `/img/<版本>/`、转义 MDX 里会报错的裸 `{变量名}`，
并重写 `versioned_sidebars`。章节名的英文文件名写在脚本的 `SLUGS` 表里，
没写到的章节会直接用中文标题当文件名。

## 发一个新版本

内容写完、确认 `docs/` 就是这一版的样子后：

```bash
npm run docs:version 1.3.0
```

它会把 `docs/` 复制成 `versioned_docs/version-1.3.0/`，并更新 `versions.json` 和版本下拉。
之后 `docs/` 继续作为下一版在开发的内容。

## 搜索

用 `@easyops-cn/docusaurus-search-local`：纯本地离线索引，不依赖 Algolia，
中文走 jieba 分词。配置在 `docusaurus.config.ts` 的 `themes` 段。

**注意：索引只在 `npm run build` 时生成**，`npm run start`（dev）下没有索引，
搜索框点开无结果。要看搜索效果必须：

```bash
npm run build && npm run serve
```

索引产物：`build/search-index.json`（当前版本）以及 `build/docs/<版本>/search-index.json`，
即浏览哪个版本就搜哪个版本的内容。

## 说明

- 模板自带的示例内容（教程、博客、示例首页组件）已挪到 `_demo-template/`，不参与构建，确认不需要后可删。
- `blog` 插件当前关闭，需要更新日志时再打开。
- 站点标题、导航、页脚、主题色分别在 `docusaurus.config.ts` 与 `src/css/custom.css`。
- 本机 dev 模式（`npm run start`）返回的页面是客户端渲染的空壳，直接刷新 `/docs/...`
  这类子路由会 404，写文档时用首页进入、或直接用 `build + serve` 预览。
