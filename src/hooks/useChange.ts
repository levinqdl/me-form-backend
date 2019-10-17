import { useContext } from 'react'
import Context from '../Context'
import { mergeDeep, fromJS } from 'immutable'

const useChange = () => {
  const { value, setValue } = useContext(Context)

  return (payload: Object) => {
    if (typeof payload === 'function') {
      payload = payload(value.toJS())
    }
    setValue(fromJS(payload))
  }
}

export default useChange
