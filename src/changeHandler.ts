import { set, isImmutable } from 'immutable'

export default (
  value: any,
  name: string | number,
  onChange: (v: any) => void,
  interceptor: (v: any) => any = v => v,
) => (input: any) => {
  const v = interceptor(input)
  onChange(
    isImmutable(value) && (name !== undefined && name !== '')
      ? set(value, name, v)
      : v,
  )
}
