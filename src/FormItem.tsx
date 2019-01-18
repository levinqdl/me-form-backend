import React, { ReactElement, ComponentType } from 'react'
import { Consumer, ContextValue } from './Context'
import { ElementTypeOf, Omit } from './typeUtils'

type GetPropsFromReactElement<E> = E extends ReactElement<infer P> ? P : never

interface ValidatorResult {
  rule: string
}

interface FormItemProps {
  name: string
  required?: boolean
  validator?: (value: string) => ValidatorResult
  errorMessages?: {
    [key: string]: string
  }
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

class FormItem extends React.Component<P, State> {
  constructor(props: P) {
    super(props)
    this.state = {
      error: null,
    }
  }
  getValidator() {
    const { validator, required } = this.props
    if (required) {
      return (value: string) => (value ? null : { rule: 'required' })
    }
    return validator
  }
  componentDidUpdate(prevProps: P) {
    const { value, name } = this.props
    if (value[name] !== prevProps.value[name]) {
      const validator = this.getValidator()
      if (validator) {
        const error = validator(value[name])
        this.setState({ error })
      }
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
    const { children, value, onChange, name } = this.props
    return children({
      value: value[name],
      onChange: (value: any) => onChange(value, name),
      error: this.getError(),
    })
  }
}

const ConnectedFormItem: ComponentType<FormItemProps> = props => (
  <Consumer>{context => <FormItem {...context} {...props} />}</Consumer>
)

export default ConnectedFormItem
