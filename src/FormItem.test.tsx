import React from 'react'
import Form from './Form'
import FormItem from './FormItem'
import Input from './Input'
import { render } from 'react-testing-library'

describe('FormItem', () => {
  it('uses default value when value is undefined', () => {
    const { getByLabelText } = render(
      <Form initValue={{}}>
        <FormItem name="a" defaultValue={{ b: 'default value' }}>
          <Input name="b" label="b" />
        </FormItem>
      </Form>,
    )
    expect(getByLabelText('b')).toHaveAttribute('value', 'default value')
  })
})
