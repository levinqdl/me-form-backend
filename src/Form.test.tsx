import React, { ChangeEvent } from 'react'
import { render, fireEvent } from 'react-testing-library'
import Form from './Form'
import withForm from './withForm'

const NativeInput = (label: string, props: any) => (
  <label>
    {label}
    <input {...props} />
  </label>
)

const Input = withForm({
  parser: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => value,
})(NativeInput)

describe('Form', () => {
  it('renders children', () => {
    const { getByText } = render(<Form value={{}}>form content</Form>)
    getByText('form content')
  })
  it('provide value & onChange for fields', () => {
    const { getByLabelText } = render(
      <Form value={{ f1: 'a' }}>
        <Input label="f1" name="f1" />
      </Form>,
    )
    const input = getByLabelText('f1')
    expect(input).toHaveAttribute('value', 'a')
    fireEvent.change(input, { target: { value: 'f1 changed' } })
    expect(input).toHaveAttribute('value', 'f1 changed')
  })
  it('validation: required', () => {
    render(<Form value={{ f1: '' }} />)
  })
})
