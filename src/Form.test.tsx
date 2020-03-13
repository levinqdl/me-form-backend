import React, { RefObject, useState, useEffect, useRef } from 'react'
import { act } from 'react-dom/test-utils'
import {
  cleanup,
  fireEvent,
  render,
  waitForElement,
} from '@testing-library/react'
import { useFormItem } from '.'
import Form from './Form'
import Input from './hooks/Input'
import ArrayField from './renderprops/ArrayField'
import FormItem from './renderprops/FormItem'
import { FormItemProps, Label } from './types'

afterEach(cleanup)

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
    test('form tag', () => {
      const { container } = render(
        <Form initValue={{}} formTag>
          <span>form content</span>
        </Form>,
      )
      expect(container.querySelector('form')).not.toBeNull()
    })
    it('provides value & onChange for fields', () => {
      const { getByLabelText } = render(
        <Form initValue={{ f1: 'a', '0': 'zero' }}>
          <Input label="f1" name="f1" />
          <Input label="zero" name={0} />
        </Form>,
      )
      const input = getByLabelText('f1')
      expect(input).toHaveAttribute('value', 'a')
      fireEvent.change(input, { target: { value: 'f1 changed' } })
      expect(input).toHaveAttribute('value', 'f1 changed')
      const zero = getByLabelText('zero')
      expect(zero).toHaveAttribute('value', 'zero')
    })
    test('change value is not primary type', () => {
      const Container = () => (
        <Form initValue={{ data: [] }}>
          <FormItem name="data">
            {({ onChange, value }) => (
              <>
                <ArrayField>
                  {({ remove, index }) => (
                    <div key={index}>
                      <span>index {index}</span>
                      <button onClick={remove}>remove</button>
                    </div>
                  )}
                </ArrayField>{' '}
                <button onClick={() => onChange([...value, { x: 'x' }])}>
                  Add
                </button>
              </>
            )}
          </FormItem>
        </Form>
      )
      const { getByText, queryByText } = render(<Container />)
      fireEvent.click(getByText('Add'))
      getByText('index 0')
      fireEvent.click(getByText('remove'))
      expect(queryByText('index 0')).toBeNull()
    })
    test('validator triggered after touched', () => {
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
    test('predefined validator: required', () => {
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
      fireEvent.change(input, { target: { value: 0 } })
      expect(queryByText('f1 is required')).toBeNull()
    })
    test('default error message is rule name', () => {
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
    test('validator not triggered by other fields', () => {
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
    test('validator not triggered on disabled item', () => {
      const Contianer = ({ disabled }: any) => {
        return (
          <Form initValue={{ f1: '' }}>
            {({ submit }) => (
              <>
                <Input
                  label="f1"
                  name="f1"
                  required
                  disabled={disabled}
                  errorMessages={{ required: 'f1 required' }}
                />
                <button onClick={submit}>submit</button>
              </>
            )}
          </Form>
        )
      }
      const { queryByText, getByLabelText, getByText, rerender } = render(
        <Contianer disabled />,
      )
      expect(queryByText('f1 required')).toBeNull()
      rerender(<Contianer disabled={false} />)
      expect(queryByText('f1 required')).toBeNull()
      fireEvent.click(getByText('submit'))
      getByText('f1 required')
      rerender(<Contianer disabled />)
      expect(queryByText('f1 required')).toBeNull()
    })
    test('validator on submit', () => {
      const submitValidator = jest.fn()
      const itemValidator = jest.fn()
      const Container = () => {
        const form = useRef(null)
        return (
          <Form ref={form} initValue={{}} validator={submitValidator}>
            {({ submit }) => (
              <>
                <Input name="a" label="a" validator={itemValidator} />
                <button onClick={submit}>submit</button>
                <button onClick={() => form.current.validate()}>
                  validate
                </button>
              </>
            )}
          </Form>
        )
      }
      const { getByLabelText, getByText } = render(<Container />)

      fireEvent.change(getByLabelText('a'), { target: { value: 'xxx' } })
      expect(submitValidator).not.toHaveBeenCalled()
      expect(itemValidator).toHaveBeenLastCalledWith('xxx', false)
      submitValidator.mockClear()
      itemValidator.mockClear()

      fireEvent.click(getByText('submit'))
      expect(submitValidator).toHaveBeenLastCalledWith({ a: 'xxx' })
      expect(itemValidator).toHaveBeenLastCalledWith('xxx', true)
      submitValidator.mockClear()
      itemValidator.mockClear()

      fireEvent.click(getByText('validate'))
      expect(submitValidator).toHaveBeenLastCalledWith({ a: 'xxx' })
      expect(itemValidator).toHaveBeenLastCalledWith('xxx', true)
      submitValidator.mockClear()
      itemValidator.mockClear()
    })
    test('renderprop children: submit, data, error', () => {
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
    test('predefined validator: minLength', () => {
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
    test('errorMessages', () => {
      const { getByText } = render(
        <Form
          initValue={{ g1: { a: '', b: 'b', c: '' } }}
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
                    <Input
                      name="a"
                      label="la"
                      validator={(v: string) =>
                        v === '' ? { rule: 'required' } : null
                      }
                      errorMessages={{
                        required: ([label]: [Label]) => <>{label} is missing</>,
                      }}
                    />
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
      getByText('lc is required') // upper errorMessages used, get label from Input props
      getByText('la and lb should be same') // upper errorMessages used, use label from error descriptor returned from validator
      getByText('la is missing') // errorMessages overrided, label not specified in error descriptor returned from validator, get label from Input props
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
    test('format & parse', () => {
      const onChange = jest.fn()
      const Container = ({ value }: any) => (
        <Form value={value} onChange={onChange}>
          <Input
            format={(n: number) => n.toString()}
            parse={(s: string) => Number(s)}
            name="a"
            label="a"
          />
        </Form>
      )
      const { getByLabelText, rerender } = render(
        <Container value={{ a: '' }} />,
      )
      const input = getByLabelText('a')
      expect(input).toHaveAttribute('value', '')
      fireEvent.change(input, { target: { value: '100' } })
      expect(onChange).toHaveBeenLastCalledWith({ a: 100 })
      rerender(<Container value={{ a: 100 }} />)
      expect(input).toHaveAttribute('value', '100')
      fireEvent.change(input, { target: { value: '' } })
      expect(onChange).toHaveBeenLastCalledWith({ a: 0 })
      rerender(<Container value={{ a: 0 }} />)
      expect(input).toHaveAttribute('value', '0')
    })
    describe('update associated fields', () => {
      test('uncontrolled mode', () => {
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
                  <span>c is {'c' in data ? data.c : 'removed'}</span>
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
      test('controlled mode', () => {
        const handleChange = jest.fn()
        const Container = ({ value }: any) => {
          return (
            <Form value={value} onChange={handleChange}>
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
                  <span>c is {'c' in data ? data.c : 'removed'}</span>
                </>
              )}
            </Form>
          )
        }
        const { getByText, getByLabelText, rerender } = render(
          <Container value={{ a: '', b: '', c: 'c' }} />,
        )
        getByText('c is c')
        fireEvent.change(getByLabelText('a'), { target: { value: '0' } })
        expect(handleChange).toBeCalledTimes(1)
        expect(handleChange).toHaveBeenLastCalledWith({ a: '0', b: 'false' })

        rerender(<Container value={{ a: '0', b: 'false', c: 'still here' }} />)
        expect(getByLabelText('b')).toHaveAttribute('value', 'false')
        getByText('c is still here')
        fireEvent.change(getByLabelText('a'), { target: { value: '1' } })
        expect(handleChange).toHaveBeenCalledTimes(2)
        expect(handleChange).toHaveBeenLastCalledWith({
          a: '1',
          b: 'true',
          c: 'still here',
        })
      })
      test('ArrayField initValue', () => {
        const Container = () => {
          return (
            <Form initValue={{}}>
              <ArrayField name="arr" initValue={['foo']}>
                {({ index }) => <Input label={`f${index}`} />}
              </ArrayField>
            </Form>
          )
        }
        const { getByLabelText } = render(<Container />)
        expect(getByLabelText('f0')).toHaveAttribute('value', 'foo')
      })
      test('didUpdate in ArrayField', () => {
        const Container = () => {
          return (
            <Form initValue={[{ a: 0, b: 0 }]}>
              {({ data }) => (
                <>
                  <div data-testid="count">{data.length}</div>
                  <ArrayField>
                    {({ index }) => (
                      <div key={index}>
                        <Input
                          label="a"
                          name="a"
                          didUpdate={(a: number, patch: any) => {
                            patch({ b: a })
                          }}
                        />
                        <Input label="b" name="b" />
                      </div>
                    )}
                  </ArrayField>
                </>
              )}
            </Form>
          )
        }
        const { getByLabelText, getByTestId } = render(<Container />)
        const a = getByLabelText('a')
        fireEvent.change(a, { target: { value: 1 } })
        expect(getByLabelText('b')).toHaveAttribute('value', '1')
        expect(getByTestId('count')).toHaveTextContent('1')
      })
    })
    test('id', () => {
      const { getByLabelText, getByText } = render(
        <Form initValue={{ a: { txt: '' }, b: { txt: '' } }}>
          <FormItem name="a">
            <Input name="txt" label="a" />
          </FormItem>
          <FormItem name="b">
            <Input name="txt" label="b" />
          </FormItem>
        </Form>,
      )
      expect(getByLabelText('a')).toHaveAttribute('id', 'a.txt')
      expect(getByText('a')).toHaveAttribute('for', 'a.txt')
      expect(getByLabelText('b')).toHaveAttribute('id', 'b.txt')
      expect(getByText('b')).toHaveAttribute('for', 'b.txt')
    })
    test('register', async () => {
      let id = 1
      const onSubmit = jest.fn()
      const Container = () => {
        const [value, setValue] = useState([{ id }])
        return (
          <Form value={value} onChange={setValue} onSubmit={onSubmit}>
            {({ submit }) => (
              <div>
                <ArrayField>
                  {({ remove, value: { id } }) => {
                    return (
                      <div key={id}>
                        <Input name="a" label={`a${id}`} required />
                        <button onClick={remove}>{`remove a${id}`}</button>
                      </div>
                    )
                  }}
                </ArrayField>
                <button
                  onClick={() => {
                    id += 1
                    setValue([...value, { id }])
                  }}
                >
                  add
                </button>
                <button onClick={submit}>submit</button>
              </div>
            )}
          </Form>
        )
      }
      const { getByText, getByLabelText, rerender } = render(<Container />)
      fireEvent.click(getByText('add'))
      rerender(<Container />)
      await waitForElement(() => getByLabelText('a2'))
      fireEvent.click(getByText('remove a1'))
      fireEvent.click(getByText('submit'))
      expect(onSubmit).not.toHaveBeenCalled()
      await waitForElement(() => getByText('required'))
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

describe('change whole value', () => {
  test('object value', () => {
    const UpdateValue = (props: FormItemProps) => {
      const { onChange } = useFormItem(props)
      return (
        <button
          onClick={() => {
            onChange({ a: 'a' })
          }}
        >
          update
        </button>
      )
    }
    const { getByText, getByLabelText } = render(
      <Form initValue={{}}>
        <Input name="a" label="a" />
        <UpdateValue />
      </Form>,
    )
    const btn = getByText('update')
    fireEvent.click(btn)
    expect(getByLabelText('a')).toHaveAttribute('value', 'a')
  })
  test('array value', () => {
    const UpdateValue = (props: FormItemProps) => {
      const { onChange } = useFormItem(props)
      return (
        <button
          onClick={() => {
            onChange(['a'])
          }}
        >
          update
        </button>
      )
    }
    const { getByText, getByLabelText } = render(
      <Form initValue={[]}>
        <Input name="0" label="zero" />
        <UpdateValue />
      </Form>,
    )
    fireEvent.click(getByText('update'))
    expect(getByLabelText('zero')).toHaveAttribute('value', 'a')
  })
  test('init value', () => {
    const { getByLabelText } = render(
      <Form initValue={{ a: 'a' }}>
        <Input name="a" label="a" initValue="c" />
        <Input name="b" label="b" initValue="b" />
      </Form>,
    )
    expect(getByLabelText('a')).toHaveAttribute('value', 'a')
    expect(getByLabelText('b')).toHaveAttribute('value', 'b')
  })
  test('init value with self rerendered children', async () => {
    const fn = jest.fn()
    const Child = () => {
      const [show, setShow] = useState(false)
      useEffect(() => {
        setTimeout(() => setShow(true))
      })
      return show && <Input name="b" label="b" initValue="b" />
    }
    const Container = () => {
      return (
        <Form initValue={{ a: 'a' }} onSubmit={fn}>
          {({ submit }) => (
            <>
              <Input name="a" label="a" initValue="c" />
              <Child />
              <button onClick={submit}>submit</button>
            </>
          )}
        </Form>
      )
    }
    const { getByLabelText, getByText } = render(<Container />)
    expect(getByLabelText('a')).toHaveAttribute('value', 'a')
    const b = await waitForElement(() => getByLabelText('b'))
    expect(b).toHaveAttribute('value', 'b')
    fireEvent.click(getByText('submit'))
    expect(fn).lastCalledWith({ a: 'a', b: 'b' })
  })
})
