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
    {({ value, scope, onChange, register, resetError, errorMessages }) => {
      const computedScope =
        name !== undefined && name !== '' ? [...scope, name] : scope
      const target = value.getIn(computedScope)
      return target.map((val: any, index: number) => (
        <Provider
          key={index}
          value={{
            value,
            scope: [...computedScope, index],
            onChange,
            register,
            resetError,
            errorMessages,
          }}
        >
          {children({
            index,
            value: isImmutable(val) ? val.toJS() : val,
            remove: () => {
              const x = target.delete(index)
              onChange(x, computedScope)
            },
          })}
        </Provider>
      ))
    }}
  </Consumer>
)

export default ArrayField
