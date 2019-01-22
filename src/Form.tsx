import React, { ReactNode, ReactElement } from 'react'
import { Provider, ContextValue } from './Context'
import { FormItem, ValidatorResult, ErrorMessages } from './FormItem'

export interface Value {
  [key: string]: any
}

interface Props {
  initValue: Value
  children:
    | ReactElement<any>
    | Array<ReactElement<any>>
    | ((form: { submit: () => void; error: string }) => ReactElement<any>)
  onSubmit?: (value: Value) => void
  validator?: (value: Value) => ValidatorResult
  errorMessages?: ErrorMessages
}

type State = ContextValue & {
  error: ValidatorResult
}

class Form extends React.Component<Props, State> {
  submitEventHandler = (e: any) => {
    e.preventDefault()
    this.submit()
  }
  submit = () => {
    const { onSubmit } = this.props
    if (!this.validate() && onSubmit) {
      onSubmit(this.state.value)
    }
  }
  onChange = (v: any, field: string) => {
    this.setState(({ value }) => ({
      value: {
        ...value,
        [field]: v,
      },
    }))
  }
  validate = () => {
    let error
    for (const item of this.items.values()) {
      error = item.validate()
    }
    const { validator } = this.props
    if (!error && validator) {
      error = validator(this.state.value)
      this.setState({ error })
    }
    return error
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
  state: State = {
    value: this.props.initValue,
    onChange: this.onChange,
    register: this.register,
    resetError: this.resetError,
    error: null,
  }
  getError() {
    const { errorMessages } = this.props
    const { error } = this.state
    return error
      ? errorMessages
        ? errorMessages[error.rule] || error.rule
        : error.rule
      : ''
  }
  render() {
    const { children } = this.props
    const { error, ...contextValue } = this.state
    return (
      <Provider value={contextValue}>
        <form onSubmit={this.submitEventHandler} onKeyPress={() => {}}>
          {typeof children === 'function'
            ? children({ submit: this.submit, error: this.getError() })
            : children}
        </form>
      </Provider>
    )
  }
}

export default Form
