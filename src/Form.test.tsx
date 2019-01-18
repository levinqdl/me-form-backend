import React, { ChangeEvent, ComponentType } from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import Form from './Form'
import FormItem, { FormProps } from './FormItem'

afterEach(cleanup)

const NativeInput: ComponentType<{
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}> = ({ label, ...props }) => (
  <label>
    {label}
    <input {...props} />
  </label>
)

// const FormItem = withForm({
//   parser: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => value,
//   errorMessages: {
//     required: label => `${label} is required`
//   }
// })

const Input = ({
  label,
  name,
  ...formProps
}: FormProps<typeof NativeInput>) => (
  <FormItem {...formProps} name={name}>
    {({ value, onChange, error }: any) => (
      <>
        <NativeInput
          value={value[name]}
          onChange={({ target: { value } }) => onChange(value, name)}
          label={label}
        />
        {error}
      </>
    )}
  </FormItem>
)

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
  it('validator triggered after touched', () => {
    const { getByLabelText, queryByText, getByText } = render(
      <Form value={{ f1: '' }}>
        <Input
          label="f1"
          name="f1"
          validator={(v: string) => (v ? null : { rule: 'required' })}
          errorMessages={{ required: 'f1 is required' }}
        />
      </Form>,
    )
    expect(queryByText('f1 is required')).toBeNull()
    const input = getByLabelText('f1')
    fireEvent.change(input, { target: { value: 'xxx' } })
    fireEvent.change(input, { target: { value: '' } })
    getByText('f1 is required')
  })
})
