import { createContext } from 'react'
import { Value } from './Form'
import { Validatable, ErrorMessages, Key, DidUpdate } from './types'

export interface ContextValue {
  value: Value
  onChange: (v: any, keyPath: Key[], didUpdate?: DidUpdate) => void
  scope: Key[]
  register: (name: string, formItem: Validatable) => () => void
  resetError: () => void
  errorMessages: ErrorMessages
}

const Context = createContext<ContextValue>({
  value: {},
  scope: [],
  onChange: () => {},
  register: (item, name) => () => {},
  resetError: () => {},
  errorMessages: {},
})

export default Context
