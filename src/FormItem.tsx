import React, { ReactElement, ComponentType, ReactNode } from 'react'
import { Provider, Consumer, ContextValue } from './Context'
import { ElementTypeOf, Omit } from './typeUtils'
import changeHandler from './changeHandler'

type GetPropsFromReactElement<E> = E extends ReactElement<infer P> ? P : never
import { isImmutable, is } from 'immutable'

export interface ValidatorResult {
  rule: string
  message?: string
}

export interface ErrorMessages {
  [key: string]: string
}

type FormItemProps = {
  name?: string
  required?: boolean
  minLength?: number
  validator?: (value: any) => ValidatorResult
  errorMessages?: ErrorMessages
  children:
    | ((props: {
        value: any
        onChange: (value: any) => void
        error: ValidatorResult
      }) => ReactNode)
    | ReactNode
}

interface ChildParams {
  value: any
}

type Props<TElement> = FormItemProps &
  GetPropsFromReactElement<TElement> & {
    children: ({ value }: ChildParams) => TElement
  }
export type FormProps<
  C extends ComponentType<{ value: any; onChange: any }>
> = Omit<Props<ElementTypeOf<C>>, 'value' | 'onChange' | 'children'>

type P = ContextValue & FormItemProps & { value: any; children: any }

interface State {
  error: ValidatorResult
}

export class FormItem extends React.Component<P, State> {
  constructor(props: P) {
    super(props)
    this.state = {
      error: null,
    }
  }
  validate = () => {
    const { value, name } = this.props
    const validator = this.getValidator()
    let error = null
    if (validator) {
      error = validator(isImmutable(value) ? value.toJS() : value)
    }
    this.setState({ error })
    return error
  }
  getValidator() {
    const { validator, required, minLength } = this.props
    if (required) {
      return (value: string) => (value ? null : { rule: 'required' })
    }
    if (minLength) {
      return (value: string) =>
        value.length >= minLength ? null : { rule: 'minLength' }
    }
    return validator
  }
  componentDidMount() {
    this.props.register(this.props.name, this)
  }
  componentDidUpdate(prevProps: P) {
    const { value } = this.props
    if (!is(value, prevProps.value)) {
      this.validate()
    }
  }
  getError() {
    const { errorMessages } = this.props
    const { error } = this.state
    if (error) {
      const message = error
        ? errorMessages
          ? errorMessages[error.rule] || error.rule
          : error.rule
        : ''
      return {
        message,
        ...error,
      }
    } else {
      return null
    }
  }
  register = () => () => {}
  resetError = () => {}
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
    const { value, onChange, resetError } = this.props
    return (
      <Provider
        value={{
          value,
          onChange,
          register: this.register,
          resetError: this.resetError,
        }}
      >
        <span onFocus={resetError}>{this.renderChildren()}</span>
      </Provider>
    )
  }
}

const ConnectedFormItem: ComponentType<FormItemProps> = ({
  name,
  ...props
}) => (
  <Consumer>
    {({ value, onChange, ...context }) => {
      const target = name ? value.get(name) : value
      return (
        <FormItem
          value={target}
          onChange={changeHandler(value, name, onChange)}
          name={name}
          {...context}
          {...props}
        />
      )
    }}
  </Consumer>
)

export default ConnectedFormItem
