import React from 'react'
import useFormItem from './useFormItem'
import { render, fireEvent } from '@testing-library/react'
import Form from '..'
import useChange from './useChange'

describe('useChange', () => {
  test('change by new value', () => {
    const Control = () => {
      const change = useChange()
      const onClick = () => {
        change({ a: 'a changed', b: 'b changed' })
      }
      return <button onClick={onClick}>change</button>
    }
    const Container = () => (
      <Form initValue={{ a: 'a', b: 'b' }}>
        {({ data: { a, b } }) => {
          return (
            <div>
              <span title="a">{a}</span>
              <span title="b">{b}</span>
              <Control />
            </div>
          )
        }}
      </Form>
    )
    const { getByTitle, getByText } = render(<Container />)
    fireEvent.click(getByText('change'))
    expect(getByTitle('b')).toHaveTextContent('b changed')
    expect(getByTitle('a')).toHaveTextContent('a changed')
  })
  test('change by updater', () => {
    const Control = () => {
      const change = useChange()
      const onClick = () => {
        change(({ a, b }: { a: number; b: number }) => ({
          a: a + 1,
          b: b + a,
        }))
      }
      return <button onClick={onClick}>change</button>
    }
    const Container = () => (
      <Form initValue={{ a: 10, b: 20 }}>
        {({ data: { a, b } }) => {
          return (
            <div>
              <span title="a">{a}</span>
              <span title="b">{b}</span>
              <Control />
            </div>
          )
        }}
      </Form>
    )
    const { getByTitle, getByText } = render(<Container />)
    fireEvent.click(getByText('change'))
    expect(getByTitle('b')).toHaveTextContent('30')
    expect(getByTitle('a')).toHaveTextContent('11')
  })
})
