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
  dev/                 开发指南
```

**更新日志不在版本里**，所以不放 `docs/`。它单独放在项目根的 `changelog/`，
由 `docusaurus.config.ts` 里一个独立的 docs 实例（`id: 'changelog'`，
`routeBasePath: /changelog`）承载：全站只有一份、不随版本快照走、导航栏单独一个入口。
离线包也不需要它——`docusaurus.offline.config.ts` 会把这个实例过滤掉。

**开发指南也不拆页**：`dev/index.mdx` 一篇就是全部内容（`convert-web.mjs` 里设了
`split: false`，标题层级直接用源文档的 `## / ###`）。分类只有一个页面时，
`_category_.json` 带 `link`、版本快照在 `versioned_sidebars` 里写成单个 `doc` 项，
这样侧边栏点分类名直接打开，不会多出一层「分类 > 同名页面」。

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

发布包源 md 里有几处固定笔误（如 `PresssKeyUtil`、`WrokGlobalUtil`、「识别的的文本」），
脚本的 `TEXT_FIXES` 表会在转换时统一改掉——**源文件不用动，重导也不会再把错字带回来**。
新发现源文件里的笔误，往这张表里加一行即可。

注意：脚本只负责「转换 + 去笔误」。之前对已生成页面做过的整理（标题层级统一、
清理页面末尾残留的 `---`、补写分类首页导览、`variable-extract` 的引号/表格重写）
不在脚本里，重导后需要重跑整理流程。

## 发一个新版本

内容写完、确认 `docs/` 就是这一版的样子后：

```bash
npm run docs:version 1.3.0
```

它会把 `docs/` 复制成 `versioned_docs/version-1.3.0/`，并更新 `versions.json` 和版本下拉。
之后 `docs/` 继续作为下一版在开发的内容。

## 离线版（打包进 RMT）

产物能用 `file://` 双击打开，靠的是官方 hash 路由（`future.experimental_router: 'hash'`）：
关掉 SSG、只产出一个 `index.html`、路由走 `/#/xxx`。配置见 `docusaurus.offline.config.ts`。

```bash
npm run build:offline              # 默认：最新已发布版本
npm run build:offline -- 1.1.2     # 指定版本
npm run build:offline -- -v next   # docs/（未发布的开发版）
```

产物在 `build-offline/`。手动把里面**的内容**复制到主仓库 `Web\OfflineDocs\`
（没有就新建），`PackRMT.ps1` 会把它打进 `Release\Docs`。

离线版自带一套本地搜索（`plugins/offline-search/`）：索引在构建时写成普通 `<script src>`
加载的全局变量，不 fetch、不起 Web Worker，`file://` 下可用。在线那套插件在离线配置里被换掉了。

离线版**不含更新日志**：`/changelog` 是独立于版本的页面，只在在线站点提供。

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

- 模板自带的示例内容（教程、博客、示例首页组件）、两个版本的原始 `Web/` 源、调试日志都放在 `_demo-template/`，不参与构建，也已加入 `.gitignore` 不入库，确认不需要后可删。
- `blog` 插件关闭。更新日志不走 blog，它是根目录 `changelog/` 下的独立 docs 实例。
- 站点标题、导航、页脚、主题色分别在 `docusaurus.config.ts` 与 `src/css/custom.css`。
- 本机 dev 模式（`npm run start`）返回的页面是客户端渲染的空壳，直接刷新 `/docs/...`
  这类子路由会 404，写文档时用首页进入、或直接用 `build + serve` 预览。
