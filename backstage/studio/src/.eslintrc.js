module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@unseenco\\u002Fbackstage-core/]`,
        message:
          '@unseenco/backstage/studio may not import @unseenco/backstage modules except via type imports.',
      },
    ],
  },
}
