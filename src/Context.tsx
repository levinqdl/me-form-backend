import {createContext} from "react"
import { Value } from "./Form";

export interface ContextValue {
    value: Value,
    onChange: (v: any, field: string) => void
}

const {Provider, Consumer} = createContext<ContextValue>({value: {}, onChange: () => {}})

export {
    Provider,
    Consumer,
}