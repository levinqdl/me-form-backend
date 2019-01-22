import React, { ReactElement, ComponentType } from 'react'
import { Consumer, ContextValue } from './Context'
import { ElementTypeOf, Omit } from './typeUtils'

type GetPropsFromReactElement<E> = E extends ReactElement<infer P> ? P : never

export interface ValidatorResult {
  rule: string
}

export interface ErrorMessages {
  [key: string]: string
}

interface FormItemProps {
  name: string
  required?: boolean
  minLength?: number
  validator?: (value: string) => ValidatorResult
  errorMessages?: ErrorMessages
  children: any
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

type P = ContextValue & FormItemProps & { children: (x: any) => any }

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
      error = validator(value[name])
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
    const { value, name } = this.props
    if (value[name] !== prevProps.value[name]) {
      this.validate()
    }
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
    const { children, value, onChange, name, resetError } = this.props
    return (
      <span onFocus={resetError}>
        {children({
          value: value[name],
          onChange: (value: any) => onChange(value, name),
          error: this.getError(),
        })}
      </span>
    )
  }
}

const ConnectedFormItem: ComponentType<FormItemProps> = props => (
  <Consumer>{context => <FormItem {...context} {...props} />}</Consumer>
)

export default ConnectedFormItem
