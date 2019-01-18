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
    const { value, validator, name, required } = this.props
    if (value !== prevProps.value) {
      const validator = this.getValidator()
      if (validator) {
        const error = validator(value[name])
        this.setState({ error })
      }
    }
  }
  render() {
    const { children, value, onChange, errorMessages, name } = this.props
    const { error } = this.state
    const errorMsg = error ? errorMessages[error.rule] || error.rule : ''
    return children({ value: value[name], onChange, error: errorMsg })
  }
}

const ConnectedFormItem: ComponentType<FormItemProps> = props => (
  <Consumer>{context => <FormItem {...context} {...props} />}</Consumer>
)

export default ConnectedFormItem
