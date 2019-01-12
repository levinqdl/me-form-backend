import React, { ComponentType } from 'react'
import { Consumer } from './Context'

interface Props {
  name: string
}

interface FormProps { value: any; onChange: Function }

interface Options {
  parser?: (changedValue: any) => any
}

const withForm: <WrappedProps extends FormProps>(
  options: Options,
) => (Comp: ComponentType<WrappedProps>) => ComponentType<Props> = ({
  parser = (value: any) => value,
} = {}) => Comp => ({ name, ...rest }) => (
  <Consumer>
    {({ value, onChange }) => (
      <Comp
        {...rest}
        value={value[name]}
        onChange={(v: any) => onChange(parser(v), name)}
      />
    )}
  </Consumer>
)

export default withForm
