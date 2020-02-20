import React, { ReactNode, useRef, useContext, useEffect } from 'react'
import Context from '../Context'
import { Validatable } from '../types'
import { Value } from '../Form'
import { get, set } from 'lodash-es'
import produce from 'immer'

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
    setValue,
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
  const v = get(value, computedScope, initValue ?? value)
  useEffect(() => {
    if (v === void 0 && initValue !== void 0) {
      enqueueInitializer(() => [computedScope, initValue])
    }
  }, [name])
  const target = v === void 0 ? initValue : v
  return target.map((val: any, index: number) => {
    const key = getKey ? getKey(val) : index
    return (
      <Provider
        key={key}
        value={{
          value: patchInitValue.current
            ? set(value, computedScope, initValue)
            : value,
          scope: [...computedScope, index],
          onChange,
          setValue,
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
          value: val,
          remove: () => {
            const nextValue = produce(target, (draft: any[]) => {
              draft.splice(index, 1)
            })
            items.current.splice(index, 1)
            onChange(nextValue, computedScope)
          },
        })}
      </Provider>
    )
  })
}

export default ArrayField
