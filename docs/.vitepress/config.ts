import {defineConfig} from 'vitepress'

const guideSidebar = [
  {text: 'Overview', link: '/guide/'},
  {text: 'Concepts', link: '/guide/concepts'},
  {
    text: 'Getting started',
    collapsed: false,
    items: [
      {text: 'Overview', link: '/guide/getting-started/'},
      {text: 'With THREE.js', link: '/guide/getting-started/with-three-js'},
      {text: 'With HTML / SVG', link: '/guide/getting-started/with-html'},
      {
        text: 'With React Three Fiber',
        link: '/guide/getting-started/with-react-three-fiber',
      },
    ],
  },
  {
    text: 'Manual',
    collapsed: false,
    items: [
      {text: 'Overview', link: '/guide/manual/'},
      {text: 'Projects', link: '/guide/manual/projects'},
      {text: 'Sheets', link: '/guide/manual/sheets'},
      {
        text: 'Sheet sequence variants',
        link: '/guide/manual/sheet-variants',
      },
      {
        text: 'Sheet sequence modes',
        link: '/guide/manual/sheet-modes',
      },
      {text: 'Sheet objects', link: '/guide/manual/objects'},
      {
        text: 'Linking props (showPropsOf)',
        link: '/guide/manual/show-props-of',
      },
      {text: 'Prop types', link: '/guide/manual/prop-types'},
      {text: 'Sequences', link: '/guide/manual/sequences'},
      {text: 'Assets', link: '/guide/manual/assets'},
      {text: 'Audio', link: '/guide/manual/audio'},
      {text: 'Studio', link: '/guide/manual/studio'},
      {
        text: 'Keyboard & mouse',
        link: '/guide/manual/keyboard-shortcuts',
      },
      {
        text: 'Runtime lifecycle',
        link: '/guide/manual/runtime-lifecycle',
      },
      {
        text: 'Authoring extensions',
        link: '/guide/manual/authoring-extensions',
      },
      {text: 'Advanced', link: '/guide/manual/advanced'},
    ],
  },
  {
    text: 'Backstage Lite',
    collapsed: false,
    items: [
      {text: 'Overview', link: '/guide/backstage-lite/'},
      {
        text: 'Choosing lite or full',
        link: '/guide/backstage-lite/choosing-lite-or-full',
      },
      {text: 'Getting started', link: '/guide/backstage-lite/getting-started'},
      {text: 'Variants', link: '/guide/backstage-lite/variants'},
      {text: 'Three.js', link: '/guide/backstage-lite/three-js'},
      {
        text: 'Upgrading to full',
        link: '/guide/backstage-lite/upgrading-to-full',
      },
    ],
  },
  {
    text: 'Extensions',
    collapsed: false,
    items: [
      {text: 'Overview', link: '/guide/extensions/'},
      {text: 'Three.js', link: '/guide/extensions/threejs'},
      {text: 'GSAP', link: '/guide/extensions/gsap'},
    ],
  },
]

export default defineConfig({
  title: 'Backstage.js',
  description: 'Guides and API reference for Backstage.js',
  /** Production and preview deploys live under /docs/ on the unified Netlify site. */
  base: '/docs/',
  cleanUrls: true,
  srcExclude: ['README.md'],
  themeConfig: {
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Guide', link: '/guide/'},
      {text: 'API reference', link: '/api/'},
    ],
    sidebar: {
      '/guide/': [{text: 'Guide', items: guideSidebar}],
      '/api/': [
        {
          text: 'API reference',
          items: [
            {text: 'Overview', link: '/api/'},
            {
              text: '@unseenco/backstage',
              link: '/api/backstage-core',
            },
            {
              text: '@unseenco/backstage/studio',
              link: '/api/backstage-studio',
            },
            {
              text: '@unseenco/backstage/threejs',
              link: '/api/backstage-threejs',
            },
            {
              text: '@unseenco/backstage/dataverse',
              link: '/api/backstage-dataverse',
            },
            {
              text: '@unseenco/backstage/gsap',
              link: '/api/backstage-gsap',
            },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/craftedbygc/backstage',
      },
    ],
  },
})
