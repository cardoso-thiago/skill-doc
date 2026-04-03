// @ts-check

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Skills Showcase',
  tagline: 'Catalogue of AI agent skills',
  favicon: 'img/favicon.ico',

  url: 'https://cardoso-thiago.github.io',
  baseUrl: '/skill-doc/',
  organizationName: 'cardoso-thiago',
  projectName: 'skill-doc',
  onBrokenLinks: 'ignore',
  onDuplicateRoutes: 'ignore',
  trailingSlash: false,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  plugins: [
    './plugins/skills-plugin',
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        hideOnScroll: false,
        items: [],
      },
      footer: { style: 'dark', links: [] },
      prism: {
        theme: prismThemes.dracula,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
