import React, { ChangeEvent, ComponentType } from 'react'
import FormItem, { FormProps } from './FormItem'

const NativeInput: ComponentType<{
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}> = ({ label, ...props }) => (
  <label>
    {label}
    <input {...props} />
  </label>
)

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
