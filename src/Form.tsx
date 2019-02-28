import React, { ReactElement } from 'react'
import Context, { ContextValue } from './Context'
import { ValidatorResult, ErrorMessages } from './types'
import { XOR } from './types/typeUtils'
import { fromJS, isImmutable } from 'immutable'
import { Validatable } from './types'
import parseErrorMessage from './parseErrorMessage'

export type Value = {
  [key: string]: any
}

interface UncontrolledModeProps {
  initValue: Value
}

interface ControlledModeProps {
  value: Value
  onChange: (value: Value) => void
}

type Props = XOR<UncontrolledModeProps, ControlledModeProps> & {
  children:
    | ReactElement<any>
    | Array<ReactElement<any>>
    | ((form: {
        submit: () => void
        error: string
        data?: Value
      }) => ReactElement<any>)
  onSubmit?: (value: Value) => void
  validator?: (value: Value) => ValidatorResult
  errorMessages?: ErrorMessages
  formTag?: boolean
}

type State = ContextValue & {
  error: ValidatorResult
}

class Form extends React.Component<Props, State> {
  isControlled() {
    return 'value' in this.props
  }
  submitEventHandler = (e: any) => {
    e.preventDefault()
    this.submit()
  }
  submit = () => {
    const { onSubmit } = this.props
    if (!this.validate() && onSubmit) {
      onSubmit(this.state.value.toJS())
    }
  }
  onChange = (value: any) => {
    const { onChange } = this.props
    if (onChange) {
      onChange(value.toJS())
    } else {
      this.setState({ value })
    }
  }
  validate = () => {
    let error = null
    for (const item of this.items.values()) {
      error = item.validate(true) || error
    }
    const { validator } = this.props
    if (!error && validator) {
      error = validator(this.state.value.toJS())
      this.setState({ error })
    }
    return error
  }
  items: Map<string, Validatable> = new Map()
  register = (name: string, item: Validatable) => {
    this.items.set(name, item)
    return () => {
      this.items.delete(name)
    }
  }
  resetError = () => {
    this.setState({ error: null })
  }
  state: State = {
    value: fromJS(
      this.isControlled() ? this.props.value : this.props.initValue,
    ),
    onChange: this.onChange,
    register: this.register,
    resetError: this.resetError,
    error: null,
    errorMessages: this.props.errorMessages,
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
  static getDerivedStateFromProps(props: Props, state: State) {
    if ('value' in props) {
      return {
        ...state,
        value: fromJS(props.value),
      }
    } else {
      return null
    }
  }
  render() {
    const { children, formTag, errorMessages } = this.props
    const { error, ...contextValue } = this.state
    const { value } = contextValue
    const content =
      typeof children === 'function'
        ? children({
            submit: this.submit,
            error: parseErrorMessage(error, errorMessages),
            data: isImmutable(value) ? value.toJS() : value,
          })
        : children
    return (
      <Context.Provider value={contextValue}>
        {formTag ? (
          <form onSubmit={this.submitEventHandler} onKeyPress={() => {}}>
            {content}
          </form>
        ) : (
          content
        )}
      </Context.Provider>
    )
  }
}

export default Form
