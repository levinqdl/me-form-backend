import React, { ComponentType } from 'react'
import { Consumer } from './Context'
import { Omit, GetProps } from './typeUtils'
import changeHandler from './changeHandler'

interface OwnProps {
  name: string
  required?: boolean
}

interface InjectedProps {
  value: any
  onChange: Function
}

interface Options {
  parser?: (changedValue: any) => any
  errorMessages?: {
    required?: (label: string) => string
  }
}

type Shared<
  InjectedProps,
  DecorationTargetProps extends Shared<InjectedProps, DecorationTargetProps>
> = {
  [P in Extract<
    keyof InjectedProps,
    keyof DecorationTargetProps
  >]?: InjectedProps[P] extends DecorationTargetProps[P]
    ? DecorationTargetProps[P]
    : never
}

type InferableComponentEnhancer = <C extends ComponentType<GetProps<C>>>(
  component: C,
) => ComponentType<
  OwnProps & Omit<GetProps<C>, keyof Shared<InjectedProps, GetProps<C>>>
>

const withForm: (options: Options) => InferableComponentEnhancer = ({
  parser = (value: any) => value,
} = {}) => (Comp: ComponentType<any>) => ({ name, ...rest }) => (
  <Consumer>
    {({ value, onChange }) => (
      <Comp
        {...rest}
        value={value[name]}
        onChange={changeHandler(value, name, onChange)}
      />
    )}
  </Consumer>
)

export default withForm
