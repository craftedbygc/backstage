import type {PropTypeConfig} from '@unseenco/backstage/propTypes'

export type PropConfigForType<K extends PropTypeConfig['type']> = Extract<
  PropTypeConfig,
  {type: K}
>
