import { KeyValue } from "./KeyValue";
import fs from "fs";

export type Product = {
    code: string,
    name: string,
    rank: number,
    isPickup: boolean,
}

export function loadAsProducts():Product[] {
    const products = JSON.parse(fs.readFileSync("./products.json").toString()) as Product[]
    return products.sort((l,r) => l.rank - r.rank)
}

export function loadAsKeyValue(): KeyValue[] {
    return loadAsProducts().map( x => {
        return {
            key: x.code,
            value: x.name,
        }
    })
}