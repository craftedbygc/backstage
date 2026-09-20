import {expandPropPathInput, mergePropPathInputs} from './propPathOptions'

describe('propPathOptions', () => {
  test('expands flat shorthand to backstage paths', () => {
    expect(expandPropPathInput(['visible', 'map'])).toEqual(
      expect.arrayContaining([
        'visible',
        'material.visible',
        'material.uniforms.visible',
        'transform.map',
        'material.map',
        'material.uniforms.map',
      ]),
    )
  })

  test('preserves dot paths from flat input', () => {
    expect(expandPropPathInput(['transform.position', 'material.color'])).toEqual(
      ['transform.position', 'material.color'],
    )
  })

  test('merges categorized input', () => {
    expect(
      mergePropPathInputs(
        {transform: ['visible']},
        {material: ['opacity']},
      ),
    ).toEqual(['visible', 'material.opacity'])
  })
})
