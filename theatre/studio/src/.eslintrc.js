module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@unseenco\\u002Ftheatre-core/]`,
        message:
          '@unseenco/backstage/studio may not import @unseenco/theatre-core modules except via type imports.',
      },
    ],
  },
}
