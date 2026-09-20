/**
 * @packageDocumentation
 *
 * Runtime helpers for binding Three.js objects to Backstage.js sheets.
 * For Studio devtools (`buildExtension`), import from
 * `@unseenco/backstage/threejs/extension`.
 */

export {autoAddObject} from './autoAddObject'
export {autoAddCamera} from './autoAddCamera'
export {autoAddMaterial} from './autoAddMaterial'
export {
  configureBackstageThreejs,
  mergeExcludeInput,
  resetBackstageThreejsConfig,
} from './config'
export {parseUniformGui} from './parseUniformGui'
export {EXTENSION_ID} from './constants'

export type {AutoAddObjectOptions} from './autoAddObject'
export type {
  AutoAddCameraExcludeConfig,
  AutoAddCameraExcludeInput,
  AutoAddCameraOptions,
} from './autoAddCamera'
export type {
  AutoAddMaterialExcludeConfig,
  AutoAddMaterialExcludeInput,
  AutoAddMaterialOptions,
} from './autoAddMaterial'

export type {
  AutoAddObjectDefaults,
  ExcludeConfig,
  ExcludeInput,
  PropPathInput,
  BackstageThreejsConfig,
} from './config'

export type {
  ParsedUniformGuiOptions,
  UniformGuiOptions,
  UniformWithGui,
} from './parseUniformGui'
