import React, { ReactNode } from 'react'
import { Provider, ContextValue } from './Context'
import { FormItem } from './FormItem'

export interface Value {
  [key: string]: any
}

interface Props {
  value: Value
  children: any
  onSubmit?: () => void
}

class Form extends React.Component<Props, ContextValue> {
  submit = () => {
    const { onSubmit } = this.props
    if (!this.validate() && onSubmit) {
      onSubmit()
    }
  }
  onChange = (v: any, field: string) => {
    this.setState(({ value }) => ({
      value: {
        ...value,
        [field]: v,
      },
    }))
  }
  validate = () => {
    let error
    for (const item of this.items.values()) {
      error = item.validate()
    }
    return error
  }
  items: Map<string, FormItem> = new Map()
  register = (name: string, item: FormItem) => {
    this.items.set(name, item)
    return () => {
      this.items.delete(name)
    }
  }
  state = {
    value: this.props.value,
    onChange: this.onChange,
    register: this.register,
  }
  render() {
    const { children } = this.props
    return (
      <Provider value={this.state}>
        {typeof children === 'function' ? children(this.submit) : children}
      </Provider>
    )
  }
}

export default Form
