import React, { ReactNode, useRef, useContext, useEffect } from 'react'
import Context from '../Context'
import { isImmutable, fromJS, setIn } from 'immutable'
import { Validatable } from '../types'
import { Value } from '../Form'

const { Provider } = Context

interface ChildParam {
  index: number
  value: any
  remove?: () => void
}

interface Props {
  name?: string
  children: (params: ChildParam) => ReactNode
  getKey?: (v: Value) => string
  initValue?: Value
}

const ArrayField = ({ name, children, getKey, initValue }: Props) => {
  const patchInitValue = useRef(initValue ? true : false)
  useEffect(() => {
    patchInitValue.current = false
  }, [])
  const items = useRef([])
  const {
    value,
    scope,
    onChange,
    register,
    resetError,
    errorMessages,
    enqueueInitializer,
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

  const v = value.getIn(computedScope)
  useEffect(() => {
    if (v === void 0 && initValue !== void 0) {
      enqueueInitializer(() => [computedScope, initValue])
    }
  }, [name])
  const target = v === void 0 ? fromJS(initValue) : v
  return target.map((val: any, index: number) => {
    const key = getKey ? getKey(isImmutable(val) ? val.toJS() : val) : index
    return (
      <Provider
        key={key}
        value={{
          value: patchInitValue.current
            ? setIn(value, computedScope, initValue)
            : value,
          scope: [...computedScope, index],
          onChange,
          register: (name: string, item: Validatable) => {
            const map =
              items.current[index] || (items.current[index] = new Map())
            map.set(name, item)
            return () => {
              map.delete(name)
            }
          },
          resetError,
          errorMessages,
          enqueueInitializer,
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
    )
  })
}

export default ArrayField
