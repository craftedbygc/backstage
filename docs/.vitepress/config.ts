import {defineConfig} from 'vitepress'

export default defineConfig({
  title: 'Theatre.js',
  description: 'API reference for Theatre.js packages',
  /** Production and preview deploys live under /docs/ on the unified Netlify site. */
  base: '/docs/',
  cleanUrls: true,
  srcExclude: ['README.md'],
  themeConfig: {
    nav: [
      {text: 'Home', link: '/'},
      {text: 'API reference', link: '/generated/api-reference/'},
    ],
    sidebar: {
      '/generated/api-reference/': [
        {
          text: 'API reference',
          items: [
            {text: 'Overview', link: '/generated/api-reference/'},
            {
              text: '@unseenco/theatre-core',
              link: '/generated/api-reference/theatre-core',
            },
            {
              text: '@unseenco/theatre-studio',
              link: '/generated/api-reference/theatre-studio',
            },
            {
              text: '@unseenco/theatre-threejs',
              link: '/generated/api-reference/theatre-threejs',
            },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/craftedbygc/theatre',
      },
    ],
  },
})
