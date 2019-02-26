import { ComponentType, ReactElement, ReactNode } from 'react'
import { ElementTypeOf, Omit } from './typeUtils'

export interface Validatable {
  validate: (v: any) => ValidatorResult
}

interface ChildParams {
  value: any
}

type Label = ReactNode

export interface ValidatorResult {
  rule: string
  message?: string
  labels?: Label[]
}

export interface ErrorMessages {
  [key: string]: string | ((labels: Label[]) => string)
}

export type FormItemProps = {
  name?: string
  label?: string
  defaultValue?: any
  required?: boolean
  minLength?: number
  validator?: (value: any) => ValidatorResult
  errorMessages?: ErrorMessages
  children:
    | ((props: {
        value: any
        onChange: (value: any) => void
        error: ValidatorResult
      }) => ReactNode)
    | ReactNode
}

type GetPropsFromReactElement<E> = E extends ReactElement<infer P> ? P : never

type Props<TElement> = FormItemProps &
  GetPropsFromReactElement<TElement> & {
    children: ({ value }: ChildParams) => TElement
  }

export type FormProps<
  C extends ComponentType<{ value: any; onChange: any }>
> = Omit<Props<ElementTypeOf<C>>, 'value' | 'onChange' | 'children'>
