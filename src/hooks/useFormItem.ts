import { useContext, useEffect, useRef, useState } from 'react'
import Context from '../Context'
import { get, is } from 'immutable'
import changeHandler from '../changeHandler'
import { ValidatorResult, ErrorMessages } from '../types'
import parseErrorMessage from '../parseErrorMessage'

interface FormProps<V = any> {
  name?: string
  defaultValue?: V
  validator?: (value: V) => ValidatorResult
  errorMessages?: ErrorMessages
  required?: boolean
  minLength?: number
  label?: string
  interceptor?: (v: V) => V
}

// TODO: define return type
const useFormItem: (formProps: FormProps) => any = ({
  defaultValue,
  name,
  validator,
  errorMessages,
  required,
  minLength,
  label,
  interceptor,
}) => {
  const {
    value,
    onChange,
    register,
    resetError,
    errorMessages: ctxErrorMessages,
  } = useContext(Context)
  const [error, setError] = useState(null)
  const target = name ? get(value, name, defaultValue) : value

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
  return {
    value: target,
    onChange: changeHandler(value, name, onChange, interceptor),
    error: parseError(),
    resetError,
    label,
  }
}

export default useFormItem
