import React, { ReactNode } from 'react'
import Context from '../Context'
import changeHandler from '../changeHandler'
import { isImmutable } from 'immutable'

const { Provider, Consumer } = Context

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
    {({ value, onChange, register, resetError }) => {
      const target = name !== undefined && name !== '' ? value.get(name) : value
      const handleChange = changeHandler(value, name, onChange)
      return target.map((val: any, index: number) => (
        <Provider
          key={index}
          value={{
            value: val,
            onChange: changeHandler(target, index, handleChange),
            register,
            resetError,
          }}
        >
          {children({
            index,
            value: isImmutable(val) ? val.toJS() : val,
            remove: () => {
              const x = target.delete(index)
              handleChange(x)
            },
          })}
        </Provider>
      ))
    }}
  </Consumer>
)

export default ArrayField
