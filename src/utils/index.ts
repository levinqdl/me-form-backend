import { mergeDeep, removeIn, getIn, setIn } from 'immutable'
import { Patch } from '../types'
import { Key } from 'react'
import { Value } from '../Form'
import warning from 'warning'

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

export const warnInterceptor = ({ interceptor, parse }: any) => {
  warning(
    !interceptor,
    '`interceptor` has been deprecated in favor of `parse`, and it will be removed in future release',
  )
  warning(
    !(parse && interceptor),
    '`parse` and `interceptor` are both provided, interceptor will be ignored',
  )
}
