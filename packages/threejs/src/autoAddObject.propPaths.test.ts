/*
 * @jest-environment jsdom
 */
import {privateAPI} from '@unseenco/theatre-core/privateAPIs'
import {BoxGeometry, Mesh, MeshPhongMaterial} from 'three'
import {autoAddObject, configureTheatreThreejs} from './index'
import {setupTestSheet} from '@unseenco/theatre-shared/testUtils'

async function setupSheet() {
  const {sheet} = await setupTestSheet({
    staticOverrides: {byObject: {}},
    sequence: {
      type: 'PositionalSequence',
      subUnitsPerUnit: 30,
      length: 10,
      tracksByObject: {},
    },
  })
  return sheet.publicApi
}

describe('autoAddObject transient/static options', () => {
  test('marks transform props as static via shorthand', async () => {
    const sheet = await setupSheet()
    const material = new MeshPhongMaterial({color: 0xffffff})
    const mesh = new Mesh(new BoxGeometry(1, 1, 1), material)
    mesh.name = 'Mesh'

    const obj = autoAddObject(mesh, sheet, {
      static: {transform: ['position']},
    })

    const template = privateAPI(obj).template
    expect(template.isStaticPropPath(['transform', 'position', 'x'])).toBe(true)
    expect(template.isStaticPropPath(['transform', 'rotation', 'x'])).toBe(
      false,
    )
  })

  test('marks props as transient via dot path', async () => {
    const sheet = await setupSheet()
    const material = new MeshPhongMaterial({color: 0xffffff})
    const mesh = new Mesh(new BoxGeometry(1, 1, 1), material)
    mesh.name = 'Mesh'

    const obj = autoAddObject(mesh, sheet, {
      transient: ['visible'],
    })

    const template = privateAPI(obj).template
    expect(template.isTransientPropPath(['visible'])).toBe(true)
    expect(template.isTransientPropPath(['transform', 'position', 'x'])).toBe(
      false,
    )
  })

  test('merges configureTheatreThreejs defaults with per-call options', async () => {
    const sheet = await setupSheet()
    const {reset} = configureTheatreThreejs({
      autoAddObject: {
        static: {transform: ['scale']},
      },
    })

    const material = new MeshPhongMaterial({color: 0xffffff})
    const mesh = new Mesh(new BoxGeometry(1, 1, 1), material)
    mesh.name = 'Mesh'

    const obj = autoAddObject(mesh, sheet, {
      static: {transform: ['position']},
    })

    const template = privateAPI(obj).template
    expect(template.isStaticPropPath(['transform', 'position', 'x'])).toBe(true)
    expect(template.isStaticPropPath(['transform', 'scale', 'x'])).toBe(true)

    reset()
  })
})
