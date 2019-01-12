import React, { ComponentType } from 'react'
import { Consumer, ContextValue } from './Context'

interface Props {
  name: string
}

type WrappedProps = ContextValue & { value: any }

interface Options {
  parser?: (changedValue: any) => any
}

const withForm = ({parser= (value: any) => value}: Options = {}) => (Comp: ComponentType<WrappedProps>) => ({ name }: Props) => (
  <Consumer>
    {({ value, onChange }) => <Comp value={value[name]} onChange={v => onChange(parser(v), name)} />}
  </Consumer>
)

export default withForm
