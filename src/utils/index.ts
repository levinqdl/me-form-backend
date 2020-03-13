import { get, merge, set, unset, clone } from 'lodash-es'
import { Key } from 'react'
import warning from 'warning'
import { Value } from '../Form'
import { DidUpdate, Patch } from '../types'

export const setIn = (object: Object, path: Key[], value: any) => {
  if (path.length === 0) {
    return Object.assign(object, value)
  }
  return set(object, path, value)
}

export const getIn = (object: Object, path: Key[]) => {
  if (path.length === 0) {
    return object
  }
  return get(object, path)
}

const patch = (
  value: Value,
  keyPath: Key[],
  ref: { nextValue: any },
): Patch => (payload, removeKey) => {
  const fragment = get(value, keyPath, {})
  const nextFragment = merge(fragment, payload)
  let nextValue = setIn(value, keyPath, nextFragment)
  if (removeKey) {
    unset(nextValue, removeKey)
  }
  ref.nextValue = nextValue
}

export const getNextValue = (
  state: Value,
  value: any,
  keyPath: Key[] = [],
  didUpdate: DidUpdate,
) => {
  const nextValue =
    keyPath.length === 0 ? value : set(clone(state), keyPath, value)
  const ref = { nextValue }
  if (didUpdate) {
    const copy = [...keyPath]
    copy.pop()
    didUpdate(value, patch(nextValue, copy, ref), state)
  }
  return ref.nextValue
}

export const appendScope = (scope: Key[], name: string | number) =>
  name !== '' && name !== undefined
    ? [...scope, typeof name === 'number' ? name.toString() : name]
    : scope

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
