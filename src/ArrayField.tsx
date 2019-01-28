import React, { ReactNode } from 'react'
import { Provider, Consumer } from './Context'
import changeHandler from './changeHandler'

interface ChildParam {
  index: number
  value: any
  remove?: () => void
}

interface Props {
  name?: string
  children: (params: ChildParam) => ReactNode
}

const ArrayField = ({ name, children }: Props) => (
  <Consumer>
    {({ value, onChange }) => {
      const target = name !== undefined && name !== '' ? value[name] : value
      const handleChange = changeHandler(value, name, onChange)
      return target.map((val: any, index: number) => (
        <Provider
          key={index}
          value={{
            value: val,
            onChange: changeHandler(target, index, handleChange),
            register: () => () => {},
            resetError: () => {},
          }}
        >
          {children({
            index,
            value: val,
            remove: () => {
              target.splice(index, 1)
              handleChange(target)
            },
          })}
        </Provider>
      ))
    }}
  </Consumer>
)

export default ArrayField
