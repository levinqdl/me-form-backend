import React, { ReactNode } from 'react'
import { Provider, ContextValue } from './Context'
import { FormItem } from './FormItem'

export interface Value {
  [key: string]: any
}

interface Props {
  initValue: Value
  children: any
  onSubmit?: (value: Value) => void
}

class Form extends React.Component<Props, ContextValue> {
  submitEventHandler = (e: any) => {
    e.preventDefault()
    this.submit()
  }
  submit = () => {
    const { onSubmit } = this.props
    if (!this.validate() && onSubmit) {
      onSubmit(this.state.value)
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
    value: this.props.initValue,
    onChange: this.onChange,
    register: this.register,
  }
  render() {
    const { children } = this.props
    return (
      <Provider value={this.state}>
        <form onSubmit={this.submitEventHandler} onKeyPress={() => {}}>
          {typeof children === 'function' ? children(this.submit) : children}
        </form>
      </Provider>
    )
  }
}

export default Form
