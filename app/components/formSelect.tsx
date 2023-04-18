import * as React from "react";
import { useField } from "remix-validated-form";
import { KeyValue } from "../models/KeyValue";


type InputProps = {
    name: string
    type?: string
    label: string
    value?: string
    values: KeyValue[]
}

export default function SelectInput(
    {
        name,
        label,       
        value,
        values
    }: InputProps
    ) {
    const { error, getInputProps } = useField(name)
    
    let props = {id: name}

    let myValue = value === undefined ? "" : value

    if (value == "__first__") {
        myValue = values[0].key
    }

    return (
        <>
        <label htmlFor={name} className="form-label">{(label)}</label>
        <select {...getInputProps(props)} defaultValue={myValue} className="form-select">
            {myValue == "" && (
                <option value="">-- Tous --</option>
            )}
            {values.map((item) => 
                <option value={item.key}>{item.value}</option>
            )}
        </select>        
        </>
    )
}