import { useContext, useRef, useEffect, useCallback } from 'react'
import Context from '../Context'

const useChange = () => {
  const { value, setValue } = useContext(Context)
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  const callback = useCallback((payload: Object) => {
    let next
    if (typeof payload === 'function') {
      next = payload(ref.current)
    }
    setValue(next ?? payload)
  }, [])
  return callback
}

export default useChange
