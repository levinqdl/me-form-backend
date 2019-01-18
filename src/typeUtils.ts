import { ComponentType, ComponentClass, FunctionComponent, Key } from 'react'
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type GetProps<C> = C extends ComponentType<infer P> ? P : never

export type ElementTypeOf<C> = C extends ComponentType<infer P>
  ? {
      type: ComponentClass<P> | FunctionComponent<P>
      props: P
      key: Key | null
    }
  : C extends string
  ? {
      type: string
      props: any
      key: Key | null
    }
  : never
