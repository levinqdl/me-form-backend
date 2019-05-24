import { mergeDeep, removeIn } from 'immutable'
import { Patch } from '../types'
import { Key } from 'react'
import { Value } from '../Form'

export const patch = (value: Value, ref: { nextValue: any }): Patch => (
  payload,
  removeKey,
) => {
  let nextValue = mergeDeep(value, payload)
  if (removeKey) {
    nextValue = removeIn(nextValue, removeKey.split('.'))
  }
  ref.nextValue = nextValue
}

export const appendScope = (scope: Key[], name: string) =>
  name !== '' && name !== undefined ? [...scope, name] : scope
