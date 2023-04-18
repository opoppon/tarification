import { KeyValue } from "../models/KeyValue";
import fs from "fs";

export type Agency = {
    code: string,
    name: string,
    tiersCode: string,
    zipcode: string,
}

export function loadAsAgencies(): Agency[] {
    return JSON.parse(fs.readFileSync("./agencies.json").toString())
}

export function loadAsKeyValue(): KeyValue[] {
    return loadAsAgencies().map( x => {
        return {
            key: x.code,
            value: x.name,
        }
    })
}

export function findTiersCodeForAgency(code: string|null): string|null {
    const found = loadAsAgencies().find(x => x.code == code)?.tiersCode

    return found === undefined ? null : found 
}