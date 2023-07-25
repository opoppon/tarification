import * as React from "react";
import { useField } from "remix-validated-form";


type InputProps = {
    name: string
    type?: string
    label: string
    value?: string
    required?: boolean
}

export default function FormInput(
    {
        name,
        type,
        label,       
        value,
        required
    }: InputProps
    ) {
    const { error, getInputProps } = useField(name)
    
    let props = {id: name}
    
    return (
        <>
            <label htmlFor={name} className="form-label">{(label)} {required && ("*")}</label>
            <input className="form-control" {...getInputProps(props)} defaultValue={value}/>
            {error!=null && (
                <div className="invalid-feedback">{error}</div>
            )}
        </>
    )
}