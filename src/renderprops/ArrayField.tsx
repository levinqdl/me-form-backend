import React, { ReactNode, useRef, useContext, useEffect } from 'react'
import Context from '../Context'
import changeHandler from '../changeHandler'
import { isImmutable } from 'immutable'
import { Validatable } from '../types'

const { Provider } = Context

interface ChildParam {
  index: number
  value: any
  remove?: () => void
}

interface Props {
  name?: string
  children: (params: ChildParam) => ReactNode
}

const ArrayField = ({ name, children }: Props) => {
  const items = useRef([])
  const {
    value,
    scope,
    onChange,
    register,
    resetError,
    errorMessages,
  } = useContext(Context)
  const computedScope =
    name !== undefined && name !== '' ? [...scope, name] : scope
  const id = computedScope.join('.')
  useEffect(() => {
    return register(id, {
      validate: bail => {
        let error = null
        for (const map of items.current) {
          for (const item of map.values()) {
            error = item.validate(bail) || error
          }
        }
        return error
      },
    })
  }, [id])
  const target = value.getIn(computedScope)
  return target.map((val: any, index: number) => (
    <Provider
      key={index}
      value={{
        value,
        scope: [...computedScope, index],
        onChange,
        register: (name: string, item: Validatable) => {
          const map = items.current[index] || (items.current[index] = new Map())
          map.set(name, item)
          return () => {
            map.delete(name)
          }
        },
        resetError,
        errorMessages,
      }}
    >
      {children({
        index,
        value: isImmutable(val) ? val.toJS() : val,
        remove: () => {
          const x = target.delete(index)
          items.current.splice(index, 1)
          onChange(x, computedScope)
        },
      })}
    </Provider>
  ))
}

export default ArrayField
