import { createContext } from 'react'
import { Value } from './Form'
import { FormItem } from './FormItem'

export interface ContextValue {
  value: Value
  onChange: (v: any) => void
  register: (name: string, formItem: FormItem) => () => void
  resetError: () => void
}

const { Provider, Consumer } = createContext<ContextValue>({
  value: {},
  onChange: () => {},
  register: (item, name) => () => {},
  resetError: () => {},
})

export { Provider, Consumer }
