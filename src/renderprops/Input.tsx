import React, { ChangeEvent, ComponentType } from 'react'
import FormItem from './FormItem'
import { FormProps } from '../types'
import NativeInput from '../NativeInput'

const Input = ({
  label,
  name,
  ...formProps
}: FormProps<typeof NativeInput>) => (
  <FormItem {...formProps} name={name} label={label}>
    {({ value, onChange, error, id, resetError }: any) => (
      <>
        <NativeInput
          id={id}
          value={value || ''}
          onChange={({ target: { value } }) => {
            onChange(value)
          }}
          label={label}
          onFocus={resetError}
        />
        {error && <span>{error.message}</span>}
      </>
    )}
  </FormItem>
)

export default Input
