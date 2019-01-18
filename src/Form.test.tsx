import React, { ChangeEvent, ComponentType } from 'react'
import {
  render,
  fireEvent,
  cleanup,
  wait,
  waitForDomChange,
} from 'react-testing-library'
import Form from './Form'
import FormItem, { FormProps } from './FormItem'
import { async } from 'q'

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
          value={value}
          onChange={({ target: { value } }) => onChange(value)}
          label={label}
        />
        <span>{error}</span>
      </>
    )}
  </FormItem>
)

const errorMessages = { required: 'f1 is required' }

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
          errorMessages={errorMessages}
        />
      </Form>,
    )
    expect(queryByText('f1 is required')).toBeNull()
    const input = getByLabelText('f1')
    fireEvent.change(input, { target: { value: 'xxx' } })
    fireEvent.change(input, { target: { value: '' } })
    getByText('f1 is required')
  })
  it('validator shorthand: required', () => {
    const { queryByText, getByLabelText, getByText } = render(
      <Form value={{ f1: '' }}>
        <Input label="f1" name="f1" required errorMessages={errorMessages} />
      </Form>,
    )
    expect(queryByText('f1 is required')).toBeNull()
    const input = getByLabelText('f1')
    fireEvent.change(input, { target: { value: 'xxx' } })
    fireEvent.change(input, { target: { value: '' } })
    getByText('f1 is required')
  })
  it('default error message is rule name', () => {
    const { queryByText, getByLabelText, getByText } = render(
      <Form value={{ f1: '' }}>
        <Input label="f1" name="f1" required />
      </Form>,
    )
    expect(queryByText('required')).toBeNull()
    const input = getByLabelText('f1')
    fireEvent.change(input, { target: { value: 'xxx' } })
    fireEvent.change(input, { target: { value: '' } })
    getByText('required')
  })
  it('validator not triggered by other fields', () => {
    const { queryByText, getByLabelText, getByText } = render(
      <Form value={{ f1: '' }}>
        <Input
          label="f1"
          name="f1"
          required
          errorMessages={{ required: 'f1 required' }}
        />
        <Input
          label="f2"
          name="f2"
          required
          errorMessages={{ required: 'f2 required' }}
        />
      </Form>,
    )
    expect(queryByText('f1 required')).toBeNull()
    expect(queryByText('f2 required')).toBeNull()
    const input = getByLabelText('f1')
    fireEvent.change(input, { target: { value: 'xxx' } })
    fireEvent.change(input, { target: { value: '' } })
    getByText('f1 required')
    expect(queryByText('f2 required')).toBeNull()
  })
  it('submit and validate', async () => {
    const handleSubmit = jest.fn()
    const { getByLabelText, getByText } = render(
      <Form value={{ f1: '' }} onSubmit={handleSubmit}>
        {(submit: () => void) => (
          <>
            <Input label="f1" name="f1" required />
            <button onClick={submit}>submit</button>
          </>
        )}
      </Form>,
    )
    const submitButton = getByText('submit')
    fireEvent.click(submitButton)
    getByText('required')
    const input = getByLabelText('f1')
    fireEvent.change(input, { target: { value: 'f1 changed' } })
    fireEvent.click(submitButton)
    expect(handleSubmit).toBeCalled()
  })
})
