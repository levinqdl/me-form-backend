import React from 'react'
import Form from '../Form'
import FormItem from './FormItem'
import Input from './Input'
import { render, fireEvent, cleanup } from '@testing-library/react'
import ArrayField from './ArrayField'

afterEach(cleanup)

describe('FormItem', () => {})

describe('multi-layer form', () => {
  it('pass value down to deepest layer', () => {
    const handleSubmit = jest.fn()
    const { getByLabelText, getByText } = render(
      <Form initValue={{ a: { b: '' } }} onSubmit={handleSubmit}>
        {({ submit }) => (
          <>
            <FormItem name="a">
              <Input name="b" label="b" />
            </FormItem>
            <button type="button" onClick={submit}>
              submit
            </button>
          </>
        )}
      </Form>,
    )
    const input = getByLabelText('b')
    fireEvent.change(input, { target: { value: 'b changed' } })
    expect(input).toHaveAttribute('value', 'b changed')
    const submit = getByText('submit')
    fireEvent.click(submit)
    expect(handleSubmit).toHaveBeenCalledWith({ a: { b: 'b changed' } })
  })
  it('iterate over iterable value', () => {
    const { getByLabelText, getByText, queryByLabelText } = render(
      <Form
        initValue={{
          a: ['f1', 'f2'],
          b: [
            { id: 'x', name: 'f3' },
            { id: 'y', name: 'f4' },
          ],
        }}
      >
        {() => (
          <>
            <ArrayField name="a">
              {({ index, remove }) => (
                <React.Fragment key={index}>
                  <Input name="" label={`a${index}`} />
                  <button onClick={remove}>remove a{index}</button>
                </React.Fragment>
              )}
            </ArrayField>
            <ArrayField name="b">
              {({ value, remove }) => (
                <>
                  <Input name="name" label={value.id} />
                  <button onClick={remove}>remove {value.id}</button>
                </>
              )}
            </ArrayField>
          </>
        )}
      </Form>,
    )
    const input1 = getByLabelText('a0')
    const input2 = getByLabelText('a1')
    const input3 = getByLabelText('x')
    const input4 = getByLabelText('y')
    expect(input1).toHaveAttribute('value', 'f1')
    expect(input2).toHaveAttribute('value', 'f2')
    expect(input3).toHaveAttribute('value', 'f3')
    expect(input4).toHaveAttribute('value', 'f4')
    fireEvent.change(input1, { target: { value: 'f1 changed' } })
    expect(input1).toHaveAttribute('value', 'f1 changed')
    fireEvent.change(input3, { target: { value: 'f3 changed' } })
    expect(input3).toHaveAttribute('value', 'f3 changed')
    const remove2 = getByText('remove a1')
    fireEvent.click(remove2)
    expect(queryByLabelText('a1')).toBeNull()
    const remove4 = getByText('remove y')
    fireEvent.click(remove4)

    expect(queryByLabelText('b1')).toBeNull()
  })
  it('middle layer validator', () => {
    const handleSubmit = jest.fn()
    const { getByLabelText, getByText } = render(
      <Form initValue={{ a: { b: '', c: '' } }} onSubmit={handleSubmit}>
        {({ submit }) => (
          <>
            <FormItem
              name="a"
              validator={({ b, c }) => {
                return b !== c
                  ? { rule: 'equal', message: 'b and c should be equal' }
                  : null
              }}
            >
              {({ error }) => (
                <>
                  <Input
                    name="b"
                    label="b"
                    required
                    errorMessages={{ required: 'b required' }}
                  />
                  <Input
                    name="c"
                    label="c"
                    required
                    errorMessages={{ required: 'c required' }}
                  />
                  {error && <span>{error.message}</span>}
                </>
              )}
            </FormItem>
            <button type="button" onClick={submit}>
              submit
            </button>
          </>
        )}
      </Form>,
    )
    const submit = getByText('submit')
    fireEvent.click(submit)
    getByText('b required')
    getByText('c required')
    const c = getByLabelText('c')
    fireEvent.change(c, { target: { value: 'x' } })
    getByText('b and c should be equal')
  })
})
