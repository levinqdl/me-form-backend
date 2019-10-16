import { is, isImmutable, fromJS } from 'immutable'
import {
  useContext,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react'
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
  const v = value.getIn(computedScope)
  const target = v === void 0 ? initValue : v

  const prevTarget = useRef(target)
  const pervDisabled = useRef(disabled)
  const validate = (submitting = false) => {
    let error = null
    if (!disabled) {
      if (validator) {
        error = validator(
          isImmutable(target) ? target.toJS() : target,
          submitting,
        )
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
    const changed = !is(target, prevTarget.current)
    if (prevTarget.current && changed && onValueChange) {
      setTimeout(onValueChange)
    }
    if (changed || (disabled !== pervDisabled.current && disabled)) {
      prevTarget.current = target
      validate()
    }
    validateRef.current = validate
    pervDisabled.current = disabled
  })
  useEffect(() => {
    if (v === void 0 && initValue !== void 0) {
      enqueueInitializer(() => [computedScope, initValue])
    }
    return register(name, {
      validate: () => validateRef.current(true),
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
  const memoOnChange = useCallback(
    (v: any) => {
      onChange(parser(v), computedScope, didUpdate)
    },
    [computedScope],
  )
  return {
    rest,
    value: format(isImmutable(target) ? target.toJS() : target),
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
