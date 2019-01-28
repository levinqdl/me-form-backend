import { set, isImmutable } from 'immutable'

export default (
  value: any,
  name: string | number,
  onChange: (v: any) => void,
) => (v: any) => {
  onChange(
    isImmutable(value) && (name !== undefined && name !== '')
      ? set(value, name, v)
      : v,
  )
}
