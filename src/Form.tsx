import React, { ReactNode } from 'react'
import { Provider } from './Context'

export interface Value {
    [key:string]: any
}

interface Props {
  value: Value
  children: ReactNode
}

interface State {
  value: Value
}

class Form extends React.Component<Props, State> {
  onChange = (v: any, field: string) => {
    this.setState(({ value }) => ({
      value: {
        ...value,
        [field]: v,
      },
    }))
  }
  state = {
    value: this.props.value,
    onChange: this.onChange,
  }
  render() {
    const { children } = this.props
    return (
      <Provider value={this.state}>
        <form>{children}</form>
      </Provider>
    )
  }
}

export default Form
