import { createContext } from 'react'
import { Value } from './Form'
import { FormItem } from './FormItem'

export interface ContextValue {
  value: Value
  onChange: (v: any, field: string) => void
  register: (name: string, formItem: FormItem) => () => void
}

const { Provider, Consumer } = createContext<ContextValue>({
  value: {},
  onChange: () => {},
  register: (item, name) => () => {},
})

export { Provider, Consumer }
