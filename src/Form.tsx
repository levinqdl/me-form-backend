import React, { ReactElement } from 'react'
import Context, { ContextValue } from './Context'
import {
  ValidatorResult,
  ErrorMessages,
  Key,
  DidUpdate,
  Initializer,
} from './types'
import { XOR } from './types/typeUtils'
import { fromJS, isImmutable, mergeDeep, setIn, isList } from 'immutable'
import { Validatable } from './types'
import parseErrorMessage from './parseErrorMessage'
import { getNextValue } from './utils'
import Init from './Initializer'

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
  defaultValue?: any
}

type State = ContextValue & {
  error: ValidatorResult
}

class Form extends React.Component<Props, State> {
  initializerQueue: Array<Initializer> = []
  initialize = () => {
    const { value } = this.state
    let nextValue = null
    while (this.initializerQueue.length) {
      const initializer = this.initializerQueue.shift()
      const [scope, v] = initializer()
      nextValue = setIn(nextValue || value, scope, v)
    }
    if (nextValue) {
      this.commit(nextValue)
    }
  }
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
  commit = (nextValue: any) => {
    const { onChange } = this.props
    if (onChange) {
      onChange(nextValue.toJS())
    } else {
      this.setState({ value: nextValue })
    }
  }
  onChange = (value: any, keyPath: Key[] = [], didUpdate: DidUpdate) => {
    const nextValue = getNextValue(this.state.value, value, keyPath, didUpdate)
    this.commit(nextValue)
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
  enqueueInitializer = (initializer: Initializer) => {
    if (initializer) {
      this.initializerQueue.push(initializer)
    }
  }
  register = (name: string, item: Validatable) => {
    this.items.set(name, item)
    return () => {
      this.items.delete(name)
    }
  }
  resetError = () => {
    this.setState({ error: null })
  }
  getValue = () => {
    const { value, defaultValue, initValue } = this.props
    const v = this.isControlled() ? value : initValue
    return fromJS(defaultValue ? mergeDeep(defaultValue, v) : v)
  }
  state: State = {
    value: this.getValue(),
    scope: [],
    onChange: this.onChange,
    register: this.register,
    enqueueInitializer: this.enqueueInitializer,
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
      const { defaultValue, value } = props
      return {
        ...state,
        value: fromJS(defaultValue ? mergeDeep(defaultValue, value) : value),
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
      <Init initialize={this.initialize}>
        <Context.Provider value={contextValue}>
          {formTag ? (
            <form onSubmit={this.submitEventHandler}>{content}</form>
          ) : (
            content
          )}
        </Context.Provider>
      </Init>
    )
  }
}

export default Form
