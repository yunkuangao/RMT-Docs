// 离线包搜索插件（只在 docusaurus.offline.config.ts 里挂载，在线构建完全不受影响）。
//
// 干两件事：
//   injectHtmlTags —— 往页面里塞两个普通 <script src>；经典脚本不受 file:// 的
//                     跨域限制，这是整个方案能成立的前提。
//   postBuild      —— 生成 offline-search-index.js（把索引挂到 window.__RMT_SEARCH__），
//                     并把搜索框 UI 拷进产物目录。
//
// 索引做成"脚本"而不是"json"，就是为了绕开 fetch 和 Web Worker：file:// 下
// 这两个都会被浏览器按 opaque origin 拦掉。

const fs = require('node:fs');
const path = require('node:path');
const {buildIndex} = require('./build-index');

const INDEX_FILE = 'offline-search-index.js';
const UI_FILE = 'offline-search-ui.js';
const ASSETS = [INDEX_FILE, UI_FILE];

module.exports = function offlineSearchPlugin(context, options) {
  const siteDir = context.siteDir;
  const docsPath = (options && options.docsPath) || 'docs';
  const versionLabel = (options && options.versionLabel) || '';

  return {
    name: 'offline-search',

    injectHtmlTags() {
      return {
        headTags: ASSETS.map((src) => ({
          tagName: 'script',
          attributes: {src: `./${src}`, defer: 'defer'},
        })),
      };
    },

    async postBuild(props) {
      const outDir = props.outDir || path.join(siteDir, 'build');
      const {version, docs, missing} = buildIndex({
        routes: props.routes,
        siteDir,
        docsDir: path.join(siteDir, docsPath),
        versionLabel,
      });

      fs.writeFileSync(
        path.join(outDir, INDEX_FILE),
        `window.__RMT_SEARCH__=${JSON.stringify({version, docs})};\n`,
        'utf8',
      );
      fs.copyFileSync(
        path.join(__dirname, 'search-ui.js'),
        path.join(outDir, UI_FILE),
      );

      const size = (fs.statSync(path.join(outDir, INDEX_FILE)).size / 1024).toFixed(0);
      console.log(
        `[offline-search] 索引 ${docs.length} 条 / ${size}KB（版本 ${version || '未知'}）`,
      );
      if (missing.length) {
        console.warn(
          `[offline-search] 有 ${missing.length} 个源文件读不到，已跳过：${missing
            .slice(0, 5)
            .join(', ')}`,
        );
      }
      if (!docs.length) {
        console.warn('[offline-search] 索引为空，检查 docsPath 参数是否指到了正确的版本目录');
      }
    },
  };
};
