import React, { ChangeEvent } from 'react'
import { render, fireEvent } from 'react-testing-library'
import Form from './Form'
import withForm from './withForm'

const NativeInput = ( props: any) => (
  <input
    {...props}
  />
)

const Input = withForm({parser: ({target: {value}}: ChangeEvent<HTMLInputElement>) => value})(NativeInput)

describe('Form', () => {
  it('renders children', () => {
    const { getByText } = render(<Form value={{}}>form content</Form>)
    getByText('form content')
  })
  it('provide value for fields', () => {
    const { getByLabelText } = render(
      <Form value={{ f1: 'a' }}>
        <label>
          f1
          <Input name="f1" />
        </label>
      </Form>,
    )
    const input = getByLabelText('f1')
    expect(input).toHaveAttribute('value', 'a')
    fireEvent.change(input, { target: { value: 'f1 changed' } })
    expect(input).toHaveAttribute('value', 'f1 changed')
  })
})
