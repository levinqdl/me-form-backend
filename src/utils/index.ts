import { mergeDeep, removeIn } from 'immutable'
import { Patch } from '../types'
import { Key } from 'react'
import { Value } from '../Form'

export const patch = (value: Value, commit: (value: Value) => void): Patch => (
  payload,
  removeKey,
) => {
  let nextValue = mergeDeep(value, payload)
  if (removeKey) {
    nextValue = removeIn(nextValue, removeKey.split('.'))
  }
  commit(nextValue)
}

export const appendScope = (scope: Key[], name: string) =>
  name !== '' && name !== undefined ? [...scope, name] : scope
