import fs from 'node:fs';
import path from 'node:path';
import type {Config} from '@docusaurus/types';
import baseConfig from './docusaurus.config';

// 离线版构建配置：产出能用 file:// 直接双击打开的站点，供 RMT 打包内置。
//
//   npm run build:offline                     默认取 versions.json 里的「最新已发布版本」
//   RMT_DOC_VERSION=1.1.2 npm run build:offline  指定版本
//   RMT_DOC_VERSION=next  npm run build:offline  取 docs/（未发布的开发版）

const base = baseConfig as any;
const preset = base.presets?.[0]?.[1] ?? {};
const docsOptions = {...(preset.docs ?? {})};
delete docsOptions.versions;

const siteDir = process.cwd();
const versions: string[] = fs.existsSync(path.join(siteDir, 'versions.json'))
  ? JSON.parse(fs.readFileSync(path.join(siteDir, 'versions.json'), 'utf8'))
  : [];

const requested = (process.env.RMT_DOC_VERSION ?? '').trim();
const wantNext = ['next', 'current'].includes(requested.toLowerCase());

let docsPath = 'docs';
let sidebarPath: string = docsOptions.sidebarPath ?? './sidebars.ts';
let versionLabel = '当前开发版';

if (requested && !wantNext) {
  if (!versions.includes(requested)) {
    throw new Error(
      `[build:offline] 版本不存在: ${requested}\n可用版本: ${versions.join(', ') || '(无)'}`,
    );
  }
  docsPath = `versioned_docs/version-${requested}`;
  sidebarPath = `versioned_sidebars/version-${requested}-sidebars.json`;
  versionLabel = requested;
} else if (!requested && versions.length > 0) {
  const latest = versions[0];
  docsPath = `versioned_docs/version-${latest}`;
  sidebarPath = `versioned_sidebars/version-${latest}-sidebars.json`;
  versionLabel = latest;
}

if (!fs.existsSync(path.join(siteDir, docsPath))) {
  throw new Error(`[build:offline] 文档目录不存在: ${docsPath}`);
}

const sidebarId: string =
  (base.themeConfig?.navbar?.items ?? []).find((i: any) => i.type === 'docSidebar')?.sidebarId ??
  'rmtSidebar';

console.log(`[build:offline] 文档版本: ${versionLabel}  目录: ${docsPath}`);

const offlineConfig: Config = {
  ...base,

  // hash 路由：所有页面走 /#/xxx，不做 SSG，只产出一个 index.html。
  // 这是 Docusaurus 官方为 file:// 离线浏览提供的方案（file:// 下 pushState 被禁，
  // 默认的 browser 路由点侧边栏会没反应）。
  future: {
    ...base.future,
    experimental_router: 'hash',
  },

  noIndex: true,

  // 本地搜索插件的索引是 json + fetch 加载，file:// 下会被 CORS 拦掉，离线版直接关掉。
  themes: [],

  presets: [
    [
      'classic',
      {
        ...preset,
        docs: {
          ...docsOptions,
          path: docsPath,
          sidebarPath,
          // 离线包只放一个版本，不要版本下拉
          disableVersioning: true,
        },
        sitemap: false,
      },
    ],
  ],

  themeConfig: {
    ...base.themeConfig,
    navbar: {
      ...base.themeConfig?.navbar,
      items: [
        {
          type: 'docSidebar',
          sidebarId,
          position: 'left',
          label: '使用文档',
        },
        {
          type: 'html',
          position: 'right',
          value: `<span class="navbar__version-badge">${versionLabel}</span>`,
        },
      ],
    },
  },
};

export default offlineConfig;
