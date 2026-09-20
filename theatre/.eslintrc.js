const path = require('path')

module.exports = {
  rules: {
    'no-relative-imports': [
      'warn',
      {
        aliases: [
          {
            name: '@unseenco/backstage',
            path: path.resolve(__dirname, './core/src'),
          },
          {
            name: '@unseenco/theatre-shared',
            path: path.resolve(__dirname, './shared/src'),
          },
          {
            name: '@unseenco/backstage/studio',
            path: path.resolve(__dirname, './studio/src'),
          },
        ],
      },
    ],
  },
}
