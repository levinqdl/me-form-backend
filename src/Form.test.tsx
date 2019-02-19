import React, { RefObject } from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import Form from './Form'
import FormItem from './renderprops/FormItem'
import ArrayField from './renderprops/ArrayField'
import { act } from 'react-dom/test-utils'

afterEach(cleanup)

// const FormItem = withForm({
//   parser: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => value,
//   errorMessages: {
//     required: label => `${label} is required`
//   }
// })

const errorMessages = { required: 'f1 is required' }

describe.each([
  ['render props', require('./renderprops/Input').default],
  ['hooks', require('./hooks/Input').default],
])('Form', (name, Input) => {
  describe(`Form with ${name}`, () => {
    it('renders children', () => {
      const { getByText } = render(
        <Form initValue={{}}>
          <span>form content</span>
        </Form>,
      )
      getByText('form content')
    })
    it('provide value & onChange for fields', () => {
      const { getByLabelText } = render(
        <Form initValue={{ f1: 'a' }}>
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
        <Form initValue={{ f1: '' }}>
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
        <Form initValue={{ f1: '' }}>
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
        <Form initValue={{ f1: '' }}>
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
        <Form initValue={{ f1: '' }}>
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
    it('submit and validate', () => {
      const handleSubmit = jest.fn()
      const { getByLabelText, getByText, queryByText } = render(
        <Form
          initValue={{ f1: '', f2: '' }}
          onSubmit={handleSubmit}
          validator={({ f1, f2 }: { f1: string; f2: string }) =>
            f1 === f2 ? null : { rule: 'equal' }
          }
          errorMessages={{ equal: 'f1 & f2 should be equal' }}
        >
          {({ submit, error }) => (
            <>
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
              <span>{error}</span>
              <button onClick={submit} type="button">
                submit
              </button>
            </>
          )}
        </Form>,
      )
      const submitButton = getByText('submit')
      fireEvent.click(submitButton)
      expect(handleSubmit).not.toBeCalled()
      getByText('f1 required')
      getByText('f2 required')
      const input1 = getByLabelText('f1')
      const input2 = getByLabelText('f2')
      fireEvent.change(input1, { target: { value: 'f1 changed' } })
      fireEvent.change(input2, { target: { value: 'f2 changed' } })
      fireEvent.click(submitButton)
      expect(queryByText('f1 required')).toBeNull()
      expect(queryByText('f2 required')).toBeNull()
      getByText('f1 & f2 should be equal')
      fireEvent.focus(input2)
      expect(queryByText('f1 & f2 should be equal')).toBeNull()
      fireEvent.change(input2, { target: { value: 'f1 changed' } })
      fireEvent.click(submitButton)
      expect(handleSubmit).toBeCalled()
    })
    it('predefined validator: minLength', () => {
      const { getByText, getByLabelText, queryByText } = render(
        <Form initValue={{ f1: '' }}>
          {() => (
            <Input
              label="f1"
              name="f1"
              minLength={5}
              errorMessages={{ minLength: 'length should not less than 5' }}
            />
          )}
        </Form>,
      )
      const input = getByLabelText('f1')
      fireEvent.change(input, { target: { value: 'f1va' } })
      getByText('length should not less than 5')
      fireEvent.change(input, { target: { value: 'f1val' } })
      expect(queryByText('length should not less than 5')).toBeNull()
    })
    it('has controlled mode', () => {
      const handleChange = jest.fn()
      const { getByLabelText, rerender } = render(
        <Form value={{ f1: '' }} onChange={handleChange}>
          <Input label="f1" name="f1" />
        </Form>,
      )
      const input = getByLabelText('f1')
      fireEvent.change(input, { target: { value: 'f1 changed' } })
      expect(handleChange).toHaveBeenCalledWith({ f1: 'f1 changed' })
      rerender(
        <Form value={{ f1: 'f1 changed' }} onChange={handleChange}>
          <Input label="f1" name="f1" />
        </Form>,
      )
      expect(input).toHaveAttribute('value', 'f1 changed')
    })
  })

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
            b: [{ id: 'x', name: 'f3' }, { id: 'y', name: 'f4' }],
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
              <FormItem name="b">
                <ArrayField>
                  {({ value, remove }) => (
                    <FormItem key={value.id}>
                      <Input name="name" label={value.id} />
                      <button onClick={remove}>remove {value.id}</button>
                    </FormItem>
                  )}
                </ArrayField>
              </FormItem>
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
      fireEvent.change(input3, { target: { vlaue: 'f3 changed' } })
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
                validator={({ b, c }) =>
                  b !== c
                    ? { rule: 'equal', message: 'b and c should be equal' }
                    : null
                }
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

  describe(`instance validator method with ${name}`, () => {
    it('Form', () => {
      const ref: RefObject<Form> = React.createRef()
      const { getByLabelText } = render(
        <div>
          <Form ref={ref} initValue={{ a: '', b: 'b' }}>
            <Input name="a" label="a" required />
            <Input name="b" label="b" required />
          </Form>
        </div>,
      )
      act(() => {
        const error = ref.current.validate()
        expect(error).toMatchObject({ rule: 'required' })
      })
    })
    test('FormItem', () => {
      const ref: RefObject<Form> = React.createRef()
      const { getByLabelText } = render(
        <div>
          <Form ref={ref} initValue={{ a: { b: '', c: 'c' } }}>
            <FormItem name="a">
              <Input name="b" label="b" required />
              <Input name="c" label="c" required />
            </FormItem>
          </Form>
        </div>,
      )
      act(() => {
        const error = ref.current.validate()
        expect(error).toMatchObject({ rule: 'required' })
      })
    })
  })
})
