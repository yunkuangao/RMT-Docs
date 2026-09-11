import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PluginOptions as SearchOptions} from '@easyops-cn/docusaurus-search-local';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'RMT 文档',
  tagline: 'RMT 帮助文档，含最新版与历史版本',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    faster: true,
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // 版本下拉里，"当前开发版" 显示的标签
          versions: {
            current: {
              label: '最新版',
            },
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // 全局搜索：纯本地离线索引，中文用 jieba 分词，多版本文档一起索引
  // 选项见 https://github.com/easyops-cn/docusaurus-search-local
  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        // 中文分词（内置 @node-rs/jieba），英文一并支持
        language: ['zh', 'en'],
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        // 结果里显示所属版本/路径
        explicitSearchResultPath: true,
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        searchResultContextMaxLength: 40,
        hashed: true,
        ignoreFiles: [/llms[^/]*\.txt$/],
      } satisfies SearchOptions,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'RMT 文档',
      logo: {
        alt: 'RMT Logo',
        src: 'img/rmt-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'rmtSidebar',
          position: 'left',
          label: '使用文档',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '使用文档',
              to: '/docs/',
            },
            {
              label: '指令手册',
              to: '/docs/commands/',
            },
            {
              label: '常见问题',
              to: '/docs/faq/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} RMT. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
