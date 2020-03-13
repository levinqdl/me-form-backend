import { setIn } from './utils'

export default (
  value: any,
  name: string | number,
  onChange: (v: any) => void,
  interceptor: (v: any) => any = v => v,
) => (input: any) => {
  const v = interceptor(input)
  onChange(name !== undefined && name !== '' ? setIn(value, [name], v) : v)
}
