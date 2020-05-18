import {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import Context from '../Context'
import parseErrorMessage from '../parseErrorMessage'
import { FormItemProps } from '../types'
import { appendScope, warnInterceptor, getIn } from '../utils'
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
    onValueChange,
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
  const computedScope = useMemo(() => appendScope(scope, name), [scope, name])
  const v = getIn(value, computedScope)
  const target = v === void 0 ? initValue : v

  const prevTarget = useRef(target)
  const pervDisabled = useRef(disabled)
  const validate = (submitting = false) => {
    if (disabled) {
      if (error !== null) setError(null)
      return null
    }
    let currentError = error
    const changed = target !== prevTarget.current

    if (changed || submitting) {
      currentError = null
      if (validator) {
        currentError = validator(target, submitting)
      }
      if (!currentError && required && !validators.required(target)) {
        currentError = { rule: 'required', labels: [label] }
      }
      if (!currentError && minLength) {
        currentError =
          target.length >= minLength
            ? null
            : { rule: 'minLength', labels: [label] }
      }
    }
    if (currentError !== error) {
      setError(currentError)
    }
    return currentError
  }
  const validateRef = useRef(validate)
  useEffect(() => {
    const changed = target !== prevTarget.current
    if (prevTarget.current && changed && onValueChange) {
      setTimeout(onValueChange)
    }
    if (changed || (disabled !== pervDisabled.current && disabled)) {
      validate()
      prevTarget.current = target
    }
    validateRef.current = validate
    pervDisabled.current = disabled
  })
  useEffect(() => {
    if (v === void 0 && initValue !== void 0) {
      enqueueInitializer(() => [computedScope, initValue])
    }
    return register(name, {
      validate: submitting => validateRef.current(submitting),
    })
  }, [name])
  const parseError = () => {
    if (error) {
      const message = parseErrorMessage(
        error,
        {
          ...ctxErrorMessages,
          ...errorMessages,
        },
        label,
      )
      return {
        message,
        ...error,
      }
    }
    return null
  }
  const memoOnChange = useCallback(
    (v: any) => {
      onChange(parser(v), computedScope, didUpdate)
    },
    [computedScope],
  )
  return {
    rest,
    value: format(target),
    onChange: memoOnChange,
    error: parseError(),
    resetError,
    label,
    disabled,
    required,
    id: computedScope.join('.'),
  }
}

export default useFormItem
