import { mergeDeep, removeIn } from 'immutable'
import { ContextValue } from './Context'
import { Patch } from './types'
import { Value } from './Form'

export default (value: Value, onChange: ContextValue['onChange']): Patch => (
  payload,
  removeKey,
) => {
  let nextValue = mergeDeep(value, payload)
  if (removeKey) {
    nextValue = removeIn(nextValue, removeKey.split('.'))
  }
  onChange(nextValue)
}
