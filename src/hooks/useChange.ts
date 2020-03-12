import { useContext, useRef, useEffect, useCallback } from 'react'
import Context from '../Context'
import produce from 'immer'

const useChange = () => {
  const { value, setValue } = useContext(Context)
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  const callback = useCallback((payload: Object) => {
    let next
    if (typeof payload === 'function') {
      next = produce(ref.current, draft => payload(draft))
    }
    setValue(next ?? payload)
  }, [])
  return callback
}

export default useChange
