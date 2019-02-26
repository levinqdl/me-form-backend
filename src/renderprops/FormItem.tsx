import React, { ComponentType } from 'react'
import Context, { ContextValue } from '../Context'
import changeHandler from '../changeHandler'
import { get } from 'immutable'
import { FormItemProps } from '../types'
import { ValidatorResult } from '../types'
import { isImmutable, is } from 'immutable'
import parseErrorMessage from '../parseErrorMessage'

type P = ContextValue & FormItemProps & { value: any; children: any }

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
    const { value } = this.props
    const validator = this.getValidator()
    let error = null
    if (validator) {
      error = validator(isImmutable(value) ? value.toJS() : value)
    }
    this.setState({ error })
    return error || childrenError
  }
  getValidator() {
    const { validator, required, minLength, label } = this.props
    if (required) {
      return (value: string) =>
        value ? null : { rule: 'required', labels: [label] }
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
    const { value } = this.props
    if (!is(value, prevProps.value)) {
      this.validate()
    }
  }
  getError() {
    const { errorMessages, label } = this.props
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
  renderChildren = () => {
    const { children, value, onChange } = this.props
    return typeof children === 'function'
      ? children({
          value: isImmutable(value) ? value.toJS() : value,
          onChange,
          error: this.getError(),
        })
      : children
  }
  render() {
    const { value, onChange, resetError, errorMessages } = this.props
    return (
      <Context.Provider
        value={{
          value,
          onChange,
          register: this.register,
          resetError: this.resetError,
          errorMessages,
        }}
      >
        <span onFocus={resetError}>{this.renderChildren()}</span>
      </Context.Provider>
    )
  }
}

const ConnectedFormItem: ComponentType<FormItemProps> = ({
  name,
  defaultValue,
  errorMessages,
  ...props
}) => (
  <Context.Consumer>
    {({ value, onChange, errorMessages: ctxErrorMessages, ...context }) => {
      const target = name ? get(value, name, defaultValue) : value
      return (
        <FormItem
          value={target}
          onChange={changeHandler(value, name, onChange)}
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
