import { ValidatorResult, ErrorMessages, Label } from './types'

export default (
  error: ValidatorResult,
  errorMessages: ErrorMessages,
  label: Label,
) => {
  if (error) {
    if (errorMessages) {
      const message = errorMessages[error.rule]
      if (message) {
        if (typeof message === 'function') {
          return message(error.labels ?? [label])
        } else return message
      }
    }
    return error.rule
  }
  return ''
}
