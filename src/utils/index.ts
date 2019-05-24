import { mergeDeep, removeIn, getIn, setIn } from 'immutable'
import { Patch } from '../types'
import { Key } from 'react'
import { Value } from '../Form'

export const patch = (
  value: Value,
  keyPath: Key[],
  ref: { nextValue: any },
): Patch => (payload, removeKey) => {
  const fragment = getIn(value, keyPath, {})
  const nextFragment = mergeDeep(fragment, payload)
  let nextValue = setIn(value, keyPath, nextFragment)
  if (removeKey) {
    nextValue = removeIn(nextValue, removeKey.split('.'))
  }
  ref.nextValue = nextValue
}

export const appendScope = (scope: Key[], name: string) =>
  name !== '' && name !== undefined ? [...scope, name] : scope
