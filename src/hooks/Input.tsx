import React from 'react'
import { FormProps } from '../types'
import NativeInput from '../NativeInput'
import useFormItem from './useFormItem'

const Input = ({ label, ...formProps }: FormProps<typeof NativeInput>) => {
  const { value, onChange, error, resetError } = useFormItem(formProps)
  return (
    <span onFocus={resetError}>
      <NativeInput
        value={value || ''}
        onChange={({ target: { value } }) => onChange(value)}
        label={label}
      />
      {error && <span>{error.message}</span>}
    </span>
  )
}

export default Input
