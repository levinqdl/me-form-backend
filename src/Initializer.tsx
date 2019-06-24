import React, { useEffect } from 'react'

interface Props {
  initialize: () => void
  children: React.ReactChild
}

const Initializer = ({ children, initialize }: Props) => {
  useEffect(() => {
    initialize()
  })
  return <>{children}</>
}

export default Initializer
