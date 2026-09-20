import {
  addSheetObjectToNamespaceMap,
  buildSequenceEditorNamespaceMap,
  splitObjectKeyNamespacePath,
} from './sequenceEditorObjectNamespaces'
import type SheetObject from '@unseenco/backstage/sheetObjects/SheetObject'

function mockSheetObject(objectKey: string): SheetObject {
  return {
    address: {
      objectKey,
      projectId: 'p',
      sheetId: 's',
      sheetInstanceId: 'si',
    },
  } as SheetObject
}

describe('sequenceEditorObjectNamespaces', () => {
  test('splitObjectKeyNamespacePath matches outline slash splitting', () => {
    expect(splitObjectKeyNamespacePath('GSAP / UI / Panel show')).toEqual([
      'GSAP',
      'UI',
      'Panel show',
    ])
  })

  test('buildSequenceEditorNamespaceMap nests GSAP proxies by object key', () => {
    const map = buildSequenceEditorNamespaceMap([
      mockSheetObject('GSAP / UI / Panel show'),
      mockSheetObject('GSAP / Box choreo'),
      mockSheetObject('Regular Backstage Object'),
    ])

    expect(map.has('Regular Backstage Object')).toBe(true)
    expect(map.get('Regular Backstage Object')?.object?.address.objectKey).toBe(
      'Regular Backstage Object',
    )

    const gsap = map.get('GSAP')
    expect(gsap?.nested?.has('UI')).toBe(true)
    expect(gsap?.nested?.has('Box choreo')).toBe(true)
    expect(
      gsap?.nested
        ?.get('UI')
        ?.nested?.get('Panel show')
        ?.object?.address.objectKey,
    ).toBe('GSAP / UI / Panel show')
    expect(gsap?.nested?.get('Box choreo')?.object?.address.objectKey).toBe(
      'GSAP / Box choreo',
    )
  })

  test('addSheetObjectToNamespaceMap is stable for repeated inserts', () => {
    const map = buildSequenceEditorNamespaceMap([])
    const obj = mockSheetObject('GSAP / UI / Panel hide')
    addSheetObjectToNamespaceMap(map, obj)
    expect(
      map.get('GSAP')?.nested?.get('UI')?.nested?.get('Panel hide')?.object
        ?.address.objectKey,
    ).toBe('GSAP / UI / Panel hide')
  })
})
