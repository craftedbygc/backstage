module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@unseenco\\u002Ftheatre-studio/]`,
        message:
          '@unseenco/backstage may not import @unseenco/backstage/studio modules except via type imports.',
      },
    ],
  },
}
