import { mergeDeep, removeIn, getIn, setIn, fromJS } from 'immutable'
import { Patch, DidUpdate } from '../types'
import { Key } from 'react'
import { Value } from '../Form'
import warning from 'warning'

const patch = (
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

export const getNextValue = (
  state: Value,
  value: any,
  keyPath: Key[] = [],
  didUpdate: DidUpdate,
) => {
  const nextValue =
    keyPath.length === 0 ? fromJS(value) : setIn(state, keyPath, value)
  const ref = { nextValue }
  if (didUpdate) {
    const copy = [...keyPath]
    copy.pop()
    didUpdate(value, patch(nextValue, copy, ref), state.toJS())
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
