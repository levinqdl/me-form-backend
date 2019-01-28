export default (
  value: any,
  name: string | number,
  onChange: (v: any) => void,
) => (v: any) => {
  let val
  if (name !== undefined && name !== '') {
    value[name] = v
    val = value
  } else {
    val = v
  }
  onChange(val)
}
