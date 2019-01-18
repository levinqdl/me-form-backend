import React, { ReactElement, ComponentType } from 'react'
import { Consumer, ContextValue } from './Context'
import { ElementTypeOf, Omit } from './typeUtils'
import { any } from 'prop-types'

type GetPropsFromReactElement<E> = E extends ReactElement<infer P> ? P : never

interface ValidatorResult {
  rule: string
}

interface FormItemProps {
  required?: boolean
  validator?: (value: string) => ValidatorResult
  name: string
  errorMessages?: {
    [key: string]: string
  }
}

type Props<TElement> = FormItemProps & GetPropsFromReactElement<TElement>
export type FormProps<
  C extends ComponentType<{ value: any; onChange: any }>
> = Omit<Props<ElementTypeOf<C>>, 'value' | 'onChange'>

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
  componentDidUpdate(prevProps: P) {
    const { value, validator, name } = this.props
    if (value !== prevProps.value && validator) {
      const error = validator(value[name])
      this.setState({ error })
    }
  }
  render() {
    const { children, value, onChange, errorMessages } = this.props
    const { error } = this.state
    const errorMsg = error ? errorMessages[error.rule] || error.rule : ''
    return children({ value, onChange, error: errorMsg })
  }
}

const x: <T extends ReactElement<any>>(
  props: Props<T>,
) => ReactElement<any> = ({ children, ...rest }) => (
  <Consumer>
    {context => (
      <FormItem {...context} {...rest}>
        {children}
      </FormItem>
    )}
  </Consumer>
)

export default x
