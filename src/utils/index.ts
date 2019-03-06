import { mergeDeep, removeIn } from 'immutable'
import { ContextValue } from '../Context'
import { Patch } from '../types'
import { Value } from '../Form'
import { Key } from 'react'

export const patch = (
  value: Value,
  onChange: ContextValue['onChange'],
): Patch => (payload, removeKey) => {
  let nextValue = mergeDeep(value, payload)
  if (removeKey) {
    nextValue = removeIn(nextValue, removeKey.split('.'))
  }
  onChange(nextValue)
}

export const appendScope = (scope: Key[], name: string) =>
  name !== '' && name !== undefined ? [...scope, name] : scope
