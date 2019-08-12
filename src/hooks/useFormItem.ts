import { is, isImmutable, fromJS } from 'immutable'
import { useContext, useEffect, useRef, useState } from 'react'
import Context from '../Context'
import parseErrorMessage from '../parseErrorMessage'
import { FormItemProps } from '../types'
import { appendScope, warnInterceptor } from '../utils'
import * as validators from '../utils/validators'

// TODO: define return type
const useFormItem: (formProps: FormItemProps) => any = props => {
  warnInterceptor(props)
  const {
    name,
    validator,
    errorMessages,
    required,
    minLength,
    label,
    interceptor,
    didUpdate,
    format = (s: any) => s,
    parse,
    initValue,
    disabled,
    ...rest
  } = props
  const parser = parse || interceptor || (v => v)
  const {
    value,
    onChange,
    register,
    enqueueInitializer,
    resetError,
    errorMessages: ctxErrorMessages,
    scope,
  } = useContext(Context)
  const [error, setError] = useState(null)
  const computedScope = appendScope(scope, name)
  const v = value.getIn(computedScope)
  const target = v === void 0 ? initValue : v

  const prevTarget = useRef(target)
  const pervDisabled = useRef(disabled)
  const validate = () => {
    let error = null
    if (!disabled) {
      if (validator) {
        error = validator(target)
      } else if (required && !validators.required(target)) {
        error = { rule: 'required', labels: [label] }
      } else if (minLength) {
        error =
          target.length >= minLength
            ? null
            : { rule: 'minLength', labels: [label] }
      }
    }

    setError(error)
    return error
  }
  const validateRef = useRef(validate)
  useEffect(() => {
    if (
      !is(target, prevTarget.current) ||
      (disabled !== pervDisabled.current && disabled)
    ) {
      prevTarget.current = target
      pervDisabled.current = disabled
      validate()
    }
    validateRef.current = validate
  })
  useEffect(() => {
    if (v === void 0 && initValue !== void 0) {
      enqueueInitializer(() => [computedScope, initValue])
    }
    return register(name, {
      validate: () => validateRef.current(),
    })
  }, [name])

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
    rest,
    value: format(isImmutable(target) ? target.toJS() : target),
    onChange: (v: any) => {
      onChange(parser(v), computedScope, didUpdate)
    },
    error: parseError(),
    resetError,
    label,
    disabled,
    required,
    id: computedScope.join('.'),
  }
}

export default useFormItem
