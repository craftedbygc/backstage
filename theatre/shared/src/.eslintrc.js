module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@unseenco\\u002Ftheatre-(core|studio)/]`,
        message:
          '@unseenco/theatre-shared may not import @unseenco/backstage or @unseenco/backstage/studio modules except via type imports.',
      },
    ],
  },
}
