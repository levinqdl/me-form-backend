import { is, isImmutable, fromJS, setIn } from 'immutable'
import React, { ComponentType, ReactNode } from 'react'
import Context, { ContextValue } from '../Context'
import parseErrorMessage from '../parseErrorMessage'
import {
  FormItemProps,
  ValidatorResult,
  Key,
  DidUpdate,
  Initializer,
} from '../types'
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
  validate = (isSubmit?: boolean) => {
    let childrenError: ValidatorResult = null
    if (isSubmit) {
      for (const item of this.items.values()) {
        childrenError = item.validate(isSubmit) || childrenError
      }
    }
    const { target } = this.props
    const validator = this.getValidator()
    let error = null
    if (validator) {
      error = validator(isImmutable(target) ? target.toJS() : target)
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
    const { target } = this.props
    if (!is(target, prevProps.target)) {
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
  diffScope = (current: Key[], child: Key[]) => {
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
    let nextValue = v
    if (childScope) {
      const diffScope = this.diffScope(currentScope, childScope)
      nextValue = getNextValue(target, v, diffScope, didUpdate)
    }
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
    const { children, target, format = (s: any) => s, scope } = this.props

    return typeof children === 'function'
      ? children({
          value: format(isImmutable(target) ? target.toJS() : target),
          onChange: this.handleChange,
          error: this.getError(),
          id: scope.join('.'),
        })
      : children
  }
  render() {
    const {
      value,
      resetError,
      errorMessages,
      scope,
      enqueueInitializer,
    } = this.props
    return (
      <Context.Provider
        value={{
          value,
          scope,
          onChange: this.handleChange,
          register: this.register,
          resetError: this.resetError,
          errorMessages,
          enqueueInitializer,
        }}
      >
        <span onFocus={resetError}>{this.renderChildren()}</span>
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
