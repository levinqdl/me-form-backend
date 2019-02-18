import { createContext } from 'react'
import { Value } from './Form'
import { Validatable } from './types'

export interface ContextValue {
  value: Value
  onChange: (v: any) => void
  register: (name: string, formItem: Validatable) => () => void
  resetError: () => void
}

const Context = createContext<ContextValue>({
  value: {},
  onChange: () => {},
  register: (item, name) => () => {},
  resetError: () => {},
})

export default Context
