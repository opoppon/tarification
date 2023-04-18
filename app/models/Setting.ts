import { KeyValue } from "./KeyValue";

export type Setting = {
    name: string
    code: string
}

export function toKeyValue(values: Setting[]): KeyValue[] {
    return values.map( x => {
        return {
            key: x.code,
            value: x.name
        }
    })
}