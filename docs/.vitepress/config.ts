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
      {text: 'API reference', link: '/api/'},
    ],
    sidebar: {
      '/api/': [
        {
          text: 'API reference',
          items: [
            {text: 'Overview', link: '/api/'},
            {
              text: '@unseenco/theatre-core',
              link: '/api/theatre-core',
            },
            {
              text: '@unseenco/theatre-studio',
              link: '/api/theatre-studio',
            },
            {
              text: '@unseenco/theatre-threejs',
              link: '/api/theatre-threejs',
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
