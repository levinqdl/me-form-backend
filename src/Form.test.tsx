import React, { RefObject } from 'react'
import { render, fireEvent, cleanup } from 'react-testing-library'
import Form from './Form'
import FormItem from './renderprops/FormItem'
import { act } from 'react-dom/test-utils'
import { useState } from 'react'

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
      const { container, getByText } = render(
        <Form initValue={{}}>
          <span>form content</span>
        </Form>,
      )
      getByText('form content')
      expect(container.querySelector('form')).toBeNull()
    })
    it('form tag', () => {
      const { container } = render(
        <Form initValue={{}} formTag>
          <span>form content</span>
        </Form>,
      )
      expect(container.querySelector('form')).not.toBeNull()
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
    it('renderprop children: submit, data, error', () => {
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
          {({ submit, error, data }) => (
            <>
              <Input
                label="f1"
                name="f1"
                required
                errorMessages={{ required: 'f1 required' }}
              />
              <span>{data.f1}</span>
              <Input
                label="f2"
                name="f2"
                required
                errorMessages={{ required: 'f2 required' }}
              />
              <span>{data.f2}</span>
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
      getByText('f1 changed')
      getByText('f2 changed')
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
    it('errorMessages at Form', () => {
      const { getByText } = render(
        <Form
          initValue={{ g1: { a: 'a', b: 'b', c: '' }, g2: { c: '', d: '' } }}
          errorMessages={{
            equal: ([a, b]) => `${a} and ${b} should be same`,
            required: ([label]) => `${label} is required`,
          }}
        >
          {({ submit }) => (
            <>
              <FormItem
                name="g1"
                validator={({ a, b }) =>
                  a === b ? null : { rule: 'equal', labels: ['la', 'lb'] }
                }
              >
                {({ error }) => (
                  <>
                    <Input name="c" label="lc" required />
                    <Input name="a" label="la" required />
                    <Input name="b" label="lb" required />
                    {error && <span>{error.message}</span>}
                  </>
                )}
              </FormItem>
              <button onClick={submit}>submit</button>
            </>
          )}
        </Form>,
      )
      fireEvent.click(getByText('submit'))
      getByText('lc is required')
      getByText('la and lb should be same')
    })
    it('interceptor transform changed value', () => {
      const { getByLabelText } = render(
        <Form initValue={{ a: '' }}>
          <Input interceptor={(v: string) => v.trimLeft()} name="a" label="a" />
        </Form>,
      )
      const input = getByLabelText('a')
      fireEvent.change(input, { target: { value: ' hello world' } })
      expect(input).toHaveAttribute('value', 'hello world')
    })
    test('update associated fields', () => {
      const Container = () => {
        return (
          <Form initValue={{ a: '', b: '', c: 'c' }}>
            {({ data }) => (
              <>
                <Input
                  name="a"
                  label="a"
                  didUpdate={(
                    changedValue: string,
                    patch: (v: any, removePath?: string) => void,
                  ) => {
                    if (changedValue === '0') {
                      patch({ b: 'false' }, 'c')
                    } else {
                      patch({ b: 'true' })
                    }
                  }}
                />
                <Input name="b" label="b" />
                <span>c is {data.c || 'removed'}</span>
              </>
            )}
          </Form>
        )
      }
      const { getByLabelText, getByText } = render(<Container />)
      getByText('c is c')
      fireEvent.change(getByLabelText('a'), { target: { value: '0' } })
      expect(getByLabelText('b')).toHaveAttribute('value', 'false')
      getByText('c is removed')
      fireEvent.change(getByLabelText('a'), { target: { value: '1' } })
      expect(getByLabelText('b')).toHaveAttribute('value', 'true')
    })
  })

  describe(`instance validator method with ${name}`, () => {
    it('Form', () => {
      const ref: RefObject<Form> = React.createRef()
      render(
        <Form ref={ref} initValue={{ a: '', b: 'b' }}>
          <Input name="a" label="a" required />
          <Input name="b" label="b" required />
        </Form>,
      )
      act(() => {
        const error = ref.current.validate()
        expect(error).toMatchObject({ rule: 'required' })
      })
    })
    test('FormItem', () => {
      const ref: RefObject<Form> = React.createRef()
      render(
        <Form ref={ref} initValue={{ a: { b: '', c: 'c' } }}>
          <FormItem name="a">
            <Input name="b" label="b" required />
            <Input name="c" label="c" required />
          </FormItem>
        </Form>,
      )
      act(() => {
        const error = ref.current.validate()
        expect(error).toMatchObject({ rule: 'required' })
      })
    })
  })
})

describe('defaultValue', () => {
  const Input = require('./hooks/Input').default
  it('merges initValue', () => {
    const { getByLabelText } = render(
      <Form
        initValue={{ a: { c: 'c' } }}
        defaultValue={{ a: { b: 'default b', c: 'default c' } }}
      >
        <FormItem name="a">
          <Input name="b" label="b" />
          <Input name="c" label="c" />
        </FormItem>
      </Form>,
    )
    expect(getByLabelText('b')).toHaveAttribute('value', 'default b')
    expect(getByLabelText('c')).toHaveAttribute('value', 'c')
  })
  it('merges value', () => {
    const handleChange = jest.fn()
    const Container = (props: any) => {
      return (
        <Form {...props}>
          <FormItem name="a">
            <Input name="b" label="b" />
            <Input name="c" label="c" />
          </FormItem>
        </Form>
      )
    }
    const defaultValue = { a: { b: 'default b', c: 'default c' } }
    const { getByLabelText, rerender } = render(
      <Container
        value={{ a: { c: 'c' } }}
        onChange={handleChange}
        defaultValue={defaultValue}
      />,
    )
    expect(getByLabelText('b')).toHaveAttribute('value', 'default b')
    expect(getByLabelText('c')).toHaveAttribute('value', 'c')
    fireEvent.change(getByLabelText('c'), { target: { value: 'c changed' } })
    expect(handleChange).toHaveBeenLastCalledWith({
      a: { b: 'default b', c: 'c changed' },
    })
    rerender(
      <Container
        value={{ a: { b: 'b changed' } }}
        onChange={handleChange}
        defaultValue={defaultValue}
      />,
    )
    expect(getByLabelText('b')).toHaveAttribute('value', 'b changed')
    expect(getByLabelText('c')).toHaveAttribute('value', 'default c')
  })
})
