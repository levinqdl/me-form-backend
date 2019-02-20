import React, { ChangeEvent, ComponentType } from 'react'
import FormItem from './FormItem'
import { FormProps } from '../types'
import NativeInput from '../NativeInput'

const Input = ({
  label,
  name,
  ...formProps
}: FormProps<typeof NativeInput>) => (
  <FormItem {...formProps} name={name}>
    {({ value, onChange, error }: any) => (
      <>
        <NativeInput
          value={value || ''}
          onChange={({ target: { value } }) => onChange(value)}
          label={label}
        />
        {error && <span>{error.message}</span>}
      </>
    )}
  </FormItem>
)

export default Input
