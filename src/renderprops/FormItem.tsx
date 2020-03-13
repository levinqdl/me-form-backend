import React, { ComponentType, ReactNode } from 'react'
import warning from 'warning'
import Context, { ContextValue } from '../Context'
import parseErrorMessage from '../parseErrorMessage'
import { DidUpdate, FormItemProps, Key, ValidatorResult } from '../types'
import { appendScope, getNextValue, warnInterceptor, getIn } from '../utils'
import * as validators from '../utils/validators'
import { Value } from '../Form'

type P = ContextValue & FormItemProps & { children: any; target: any }

interface State {
  error: ValidatorResult
}

class FormItem extends React.Component<P, State> {
  static defaultProps = {
    validatorDeps: (v: Value) => [v],
  }
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
    const { validator, required, minLength, label } = this.props
    let error = null
    if (!disabled) {
      if (validator) {
        error = validator(target, isSubmit)
      }
      if (!error && required) {
        error = validators.required(target)
          ? null
          : { rule: 'required', labels: [label] }
      }
      if (!error && minLength) {
        error =
          target?.length < minLength
            ? { rule: 'minLength', labels: [label] }
            : null
      }
    }
    this.setState({ error })
    return error || childrenError
  }
  unregister: () => void
  componentDidMount() {
    this.unregister = this.props.register(this.props.name, this)
  }
  componentWillUnmount() {
    this.unregister()
  }
  changed(target: Value, prevTarget: Value) {
    const { validatorDeps } = this.props
    const cur = validatorDeps(target)
    const prev = validatorDeps(prevTarget)
    if (cur.length !== prev.length) return true
    for (let i = 0; i < cur.length; i++) {
      if (cur[i] !== prev[i]) {
        return true
      }
    }
    return false
  }
  componentDidUpdate(prevProps: P) {
    const { target, disabled } = this.props
    if (
      (disabled !== prevProps.disabled && disabled) ||
      this.changed(target, prevProps.target)
    ) {
      this.validate()
    }
  }
  getError() {
    const { errorMessages, label } = this.props
    const { error } = this.state
    if (error) {
      const message = parseErrorMessage(error, errorMessages, label)
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
    const exists = this.items.has(name)
    warning(
      !exists,
      `"${name}" has been registered on this FormItem[name="${this.props.name}"], it should be registerd only once`,
    )
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
      nextValue = parser(nextValue)
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
          value: format(target),
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
      const target = getIn(value, computedScope)
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
