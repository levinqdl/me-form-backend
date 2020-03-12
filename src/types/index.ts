import { ComponentType, ReactElement, ReactNode } from 'react'
import { ElementTypeOf, Omit } from './typeUtils'
import { Value } from '../Form'

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

export type Patch = (payload: Partial<Value>, removeKey?: string) => void

export type DidUpdate = (
  changeValue: any,
  patch: Patch,
  formData: Value,
) => void

export type FormItemProps<V = any> = {
  name?: string
  label?: string
  required?: boolean
  minLength?: number
  validator?: (value: any, submitting: boolean) => ValidatorResult
  validatorDeps?: (val: Value) => Array<any>
  interceptor?: (value: V) => V
  parse?: (value: V) => V
  format?: (value: V) => V
  didUpdate?: DidUpdate
  errorMessages?: ErrorMessages
  initValue?: V
  disabled?: boolean
  onValueChange?: () => void
}

type GetPropsFromReactElement<E> = E extends ReactElement<infer P> ? P : never

type Props<TElement> = FormItemProps &
  GetPropsFromReactElement<TElement> & {
    children: ({ value }: ChildParams) => TElement
  }

export type FormProps<
  C extends ComponentType<{ value: any; onChange: any }>
> = Omit<Props<ElementTypeOf<C>>, 'value' | 'onChange' | 'children'>

export type Key = string | number

export type Initializer = () => [Key[], Value]
