import { getIn, is, mergeDeep } from 'immutable'
import { useContext, useEffect, useRef, useState } from 'react'
import Context from '../Context'
import parseErrorMessage from '../parseErrorMessage'
import { FormItemProps } from '../types'
import { patch, appendScope } from '../utils'

// TODO: define return type
const useFormItem: (formProps: FormItemProps) => any = ({
  name,
  validator,
  errorMessages,
  required,
  minLength,
  label,
  interceptor = v => v,
  didUpdate,
}) => {
  const {
    value,
    onChange,
    register,
    resetError,
    errorMessages: ctxErrorMessages,
    scope,
  } = useContext(Context)
  const [error, setError] = useState(null)
  const target = name ? getIn(value, [...scope, name], '') : value

  const prevTarget = useRef(target)
  const validate = () => {
    let error = null
    if (validator) {
      error = validator(target)
    } else if (required && !target) {
      error = { rule: 'required', labels: [label] }
    } else if (minLength) {
      error =
        target.length >= minLength
          ? null
          : { rule: 'minLength', labels: [label] }
    }
    setError(error)
    return error
  }
  const validateRef = useRef(validate)
  useEffect(() => {
    if (!is(target, prevTarget.current)) {
      prevTarget.current = target
      validate()
      if (didUpdate) {
        didUpdate(target, patch(value, onChange))
      }
    }
    validateRef.current = validate
  })

  useEffect(
    () =>
      register(name, {
        validate: () => validateRef.current(),
      }),
    [name],
  )

  const parseError = () => {
    if (error) {
      const message = parseErrorMessage(error, {
        ...errorMessages,
        ...ctxErrorMessages,
      })
      return {
        message,
        ...error,
      }
    }
    return null
  }
  const computedScope = appendScope(scope, name)
  return {
    value: target,
    onChange: (v: any) => onChange(interceptor(v), computedScope),
    error: parseError(),
    resetError,
    label,
    id: computedScope.join('.'),
  }
}

export default useFormItem
