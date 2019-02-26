import { ValidatorResult, ErrorMessages } from './types'

export default (error: ValidatorResult, errorMessages: ErrorMessages) => {
  if (error) {
    if (errorMessages) {
      const message = errorMessages[error.rule]
      if (message) {
        if (typeof message === 'function') {
          return message(error.labels)
        } else return message
      }
    }
    return error.rule
  }
  return ''
}
