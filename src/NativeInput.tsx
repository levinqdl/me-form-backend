import React, { ComponentType, ChangeEvent } from 'react'

const NativeInput: ComponentType<{
  id?: string
  label?: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onFocus?: () => void
}> = ({ label, id, ...props }) => (
  <label htmlFor={id}>
    {label}
    <input id={id} {...props} />
  </label>
)

export default NativeInput
