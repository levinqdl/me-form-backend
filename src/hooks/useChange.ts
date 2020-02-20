import { useContext, useRef, useEffect, useCallback } from 'react'
import Context from '../Context'

const useChange = () => {
  const { value, setValue } = useContext(Context)
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  const callback = useCallback((payload: Object) => {
    if (typeof payload === 'function') {
      payload = payload(ref.current)
    }
    setValue(payload)
  }, [])
  return callback
}

export default useChange
