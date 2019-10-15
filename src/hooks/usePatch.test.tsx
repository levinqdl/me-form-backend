import React from 'react'
import useFormItem from './useFormItem'
import { render, fireEvent } from '@testing-library/react'
import Form from '..'
import usePatch from './usePatch'

describe('usePatch', () => {
  test('patch update', () => {
    const Control = () => {
      const patch = usePatch()
      const onClick = () => {
        patch({ a: 'a changed', b: 'b changed' })
      }
      return <button onClick={onClick}>change</button>
    }
    const Container = () => (
      <Form initValue={{ a: 'a', b: 'b' }}>
        {({ data: { a, b } }) => {
          return (
            <div>
              <span data-testId="a">{a}</span>
              <span data-testId="b">{b}</span>
              <Control />
            </div>
          )
        }}
      </Form>
    )
    const { getByTestId, getByText } = render(<Container />)
    fireEvent.click(getByText('change'))
    expect(getByTestId('b')).toHaveTextContent('b changed')
    expect(getByTestId('a')).toHaveTextContent('a changed')
  })
})
