import React from 'react'
import { FormProps } from '../types'
import NativeInput from '../NativeInput'
import useFormItem from './useFormItem'

const Input = (props: FormProps<typeof NativeInput>) => {
  const { value, onChange, error, resetError, label, id } = useFormItem(props)
  return (
    <>
      <NativeInput
        id={id}
        value={value || ''}
        onChange={({ target: { value } }) => onChange(value)}
        label={label}
        onFocus={resetError}
      />
      {error && <span>{error.message}</span>}
    </>
  )
}

export default Input
