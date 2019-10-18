import { is, isImmutable, fromJS, setIn } from 'immutable'
import React, { ComponentType, ReactNode } from 'react'
import Context, { ContextValue } from '../Context'
import parseErrorMessage from '../parseErrorMessage'
import { FormItemProps, ValidatorResult, Key, DidUpdate } from '../types'
import { appendScope, warnInterceptor, getNextValue } from '../utils'
import * as validators from '../utils/validators'

type P = ContextValue & FormItemProps & { children: any; target: any }

interface State {
  error: ValidatorResult
}

class FormItem extends React.Component<P, State> {
  constructor(props: P) {
    super(props)
    this.state = {
      error: null,
    }
  }
  validate = (isSubmit: boolean = false) => {
    let childrenError: ValidatorResult = null
    for (const item of this.items.values()) {
      childrenError = item.validate(isSubmit) || childrenError
    }
    const { target, disabled } = this.props
    const validator = this.getValidator()
    let error = null
    if (!disabled) {
      if (validator) {
        error = validator(
          isImmutable(target) ? target.toJS() : target,
          isSubmit,
        )
      }
    }
    this.setState({ error })
    return error || childrenError
  }
  getValidator() {
    const { validator, required, minLength, label } = this.props
    if (required) {
      return (value: string) =>
        validators.required(value)
          ? null
          : { rule: 'required', labels: [label] }
    }
    if (minLength) {
      return (value: string) =>
        value.length >= minLength
          ? null
          : { rule: 'minLength', labels: [label] }
    }
    return validator
  }
  unregister: () => void
  componentDidMount() {
    this.unregister = this.props.register(this.props.name, this)
  }
  componentWillUnmount() {
    this.unregister()
  }
  componentDidUpdate(prevProps: P) {
    const { target, disabled } = this.props
    if (
      !is(target, prevProps.target) ||
      (disabled !== prevProps.disabled && disabled)
    ) {
      this.validate()
    }
  }
  getError() {
    const { errorMessages } = this.props
    const { error } = this.state
    if (error) {
      const message = parseErrorMessage(error, errorMessages)
      return {
        message,
        ...error,
      }
    } else {
      return null
    }
  }
  items: Map<string, FormItem> = new Map()
  register = (name: string, item: FormItem) => {
    this.items.set(name, item)
    return () => {
      this.items.delete(name)
    }
  }
  resetError = () => {
    this.setState({ error: null })
  }
  diffScope = (current: Key[], child: Key[] = []) => {
    let i = 0
    while (i < current.length && current[i] === child[i]) {
      i++
    }
    const diffScope = []
    while (i < child.length) {
      diffScope.push(child[i])
      i++
    }
    return diffScope
  }
  handleChange = (v: any, childScope: Key[], didUpdate: DidUpdate) => {
    const {
      parse,
      interceptor,
      onChange,
      target,
      scope: currentScope,
      didUpdate: currentDidUpdate,
    } = this.props
    const diffScope = this.diffScope(currentScope, childScope)
    let nextValue = getNextValue(target, v, diffScope, didUpdate)
    if (parse || interceptor) {
      const parser = parse || interceptor || (s => s)
      nextValue = fromJS(
        parser(isImmutable(nextValue) ? nextValue.toJS() : nextValue),
      )
    }
    onChange(nextValue, currentScope, currentDidUpdate)
  }
  renderChildren = () => {
    warnInterceptor(this.props)
    const {
      children,
      target,
      format = (s: any) => s,
      scope,
      resetError,
    } = this.props

    return typeof children === 'function'
      ? children({
          value: format(isImmutable(target) ? target.toJS() : target),
          onChange: this.handleChange,
          error: this.getError(),
          id: scope.join('.'),
          resetError,
        })
      : children
  }
  render() {
    const {
      value,
      errorMessages,
      scope,
      enqueueInitializer,
      setValue,
    } = this.props
    return (
      <Context.Provider
        value={{
          value,
          scope,
          onChange: this.handleChange,
          register: this.register,
          resetError: this.resetError,
          setValue,
          errorMessages,
          enqueueInitializer,
        }}
      >
        {this.renderChildren()}
      </Context.Provider>
    )
  }
}

type ConnectedFormItemProps<V = any> = FormItemProps<V> & {
  children:
    | ((props: {
        value: V
        onChange: (value: V) => void
        error: ValidatorResult
        id: string
      }) => ReactNode)
    | ReactNode
}

const ConnectedFormItem: ComponentType<ConnectedFormItemProps> = ({
  name,
  errorMessages,
  ...props
}) => (
  <Context.Consumer>
    {({
      value,
      scope,
      onChange,
      errorMessages: ctxErrorMessages,
      ...context
    }) => {
      const computedScope = appendScope(scope, name)
      const target = value.getIn(computedScope)
      return (
        <FormItem
          target={target}
          value={value}
          scope={computedScope}
          onChange={onChange}
          name={name}
          errorMessages={{ ...ctxErrorMessages, ...errorMessages }}
          {...context}
          {...props}
        />
      )
    }}
  </Context.Consumer>
)

export default ConnectedFormItem
