import { useContext } from 'react'
import Context from '../Context'
import { mergeDeep } from 'immutable'

const usePatch = () => {
  const { value, setValue } = useContext(Context)

  return (payload: Object) => {
    const nextValue = mergeDeep(value, payload)
    setValue(nextValue)
  }
}

export default usePatch
