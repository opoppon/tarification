import * as React from "react";
import { LoaderArgs, json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react"
import { TarifRequest } from "../models/TarifRequest";
import {getTarif, GetTarifResponse} from "../lib/teliwayService";
import { findTiersCodeForAgency } from "../models/Agency";
import { Product, loadAsProducts } from "../models/Product";
import TarifResponse from "../models/TarifResponse";

type LoaderData = {
    parameters: TarifRequest,
    result: GetTarifResponse
}

export default function Tarif() {
    const {parameters, result} = useLoaderData<LoaderData>() 
    const {tarifs, errors} = result

    const backUrlWithParams = () => {
        const queryString = Object
            .entries(parameters)
            .filter(([key, val]) => val != null && val != undefined)
            .map(([key, val]) => `${key}=${val}`).join('&');

        return `/?${queryString}`
    }

    const fixed = (n:any) => {
        if (typeof n == "number") {
            return n.toFixed(2)
        }
        else if (typeof n == "string") {
            return parseFloat(n).toFixed(2)
        }
        else {
            return n
        }
    }

    return (
        <>
            <div className="container text-center">
                <div className="row justify-content-evenly">
                    <div className="col bg-black bg-gradient text-white pt-3">
                        <h3>Départ</h3>
                        <address>
                            {parameters.zipcodeFrom} {parameters.townFrom} - {parameters.countryFrom}
                        </address>
                    </div>
                    <div className="col bg-danger text-white bg-gradient pt-3">
                        <h3>Destination</h3>
                        <address>
                            {parameters.zipcodeTo} {parameters.townTo} - {parameters.countryTo}
                        </address>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-end">
                <NavLink to="/" className="btn btn-primary mt-3 mx-3">Nouvelle demande</NavLink>
                <NavLink to={backUrlWithParams()} className="btn btn-outline-info mt-3">Modifier</NavLink>
            </div>
            <p>Le {formatDateFR(parameters.shippingDate)}</p>
            <span className="fw-bold fs-6">Taxe Gasoil non incluse.</span><br/>
            <span className="fst-italic">Hors frais liés à des coûts de représentation, de prise de RDV, ou de RPV appliquée au sein du réseau. Montant transport communiqué à titre indicatif</span>
            <h1 className="text-center mt-3">{parameters.nbUM} UM -  {parameters.weight} Kgs</h1>

            <div className="row d-flex justify-content-center mt-5">
                <div className="col-sm-6 col-lg-6">
                    <ul className="list-group">
                    { tarifs && tarifs.map((tarif) =>
                        <li className="list-group-item bg-secondary bg-gradient text-white">
                            <div className="d-flex justify-content-between">
                                <h3>{tarif.productName}</h3>
                                <span style={{fontSize: "2.5rem"}}>{tarif.netAmount} €</span>
                            </div>
                            { tarif.taxes.map((tax) => (
                                <div className="d-flex justify-content-between">
                                    <small>{tax.name}</small>
                                    <small>{fixed(tax.amount)} €</small>
                                </div>                                
                            ))}
                        </li>
                    )}
                    { errors && errors.map((error) => 
                        <li>{error}</li>
                    )}
                    </ul>
                </div>
            </div>
        </>
    )
}

function formatDateFR(value:string|null): string {
    let date = ""

    if (!!value) {
        const parts = value.split("-")
        
        date = `${parts[2]}/${parts[1]}/${parts[0]}`
    }

    return date
}

export async function loader({request}: LoaderArgs) {    
    const soapSettings = {
        url: process.env.WS_URL || "",
        user: process.env.WS_USER || "",
        password: process.env.WS_PASSWORD || ""
    }

    const url = new URL(request.url)    

    const agencyCode = url.searchParams.get("agencyCode")    
    const tiersCode = findTiersCodeForAgency(agencyCode)
    const requestArgs = {
        shippingDate: url.searchParams.get("shippingDate"),
        weight: url.searchParams.get("weight"),
        nbUM: url.searchParams.get("nbUM"),
        nbPalette: url.searchParams.get("nbPalette"),        
        zipcodeFrom: url.searchParams.get("zipcodeFrom"),
        townFrom: url.searchParams.get("townFrom"),
        countryFrom: url.searchParams.get("countryFrom"),
        zipcodeTo: url.searchParams.get("zipcodeTo"),
        townTo: url.searchParams.get("townTo"),
        countryTo: url.searchParams.get("countryTo"),
        productCode: getParam(url,"productCode"),
        agencyCode: url.searchParams.get("agencyCode"),
        tiersCode: tiersCode,
        isPickup: url.searchParams.get("isPickup"),
    } as TarifRequest
    var products = loadAsProducts()
    var {tarifs, errors} = await getTarif(requestArgs, soapSettings, products)

    const filteredTarifs = filterTarifWithProducts(tarifs, products, !!requestArgs.isPickup)

    return json({
        parameters: requestArgs,
        result: {
            tarifs: filteredTarifs,
            errors: errors
        } as GetTarifResponse
    })
}

function filterTarifWithProducts(tarifs: TarifResponse[], products: Product[], isPickup: boolean): TarifResponse[] {
    const validProducts = isPickup ? products.filter(x => x.isPickup) : products.filter(x => !x.isPickup)
    const codes = validProducts.map(x => x.code)

    return tarifs.filter(x => codes.indexOf(x.productCode) >= 0)
}

function getParam(url: URL, value: string): string|null {
    const result = url.searchParams.get(value)

    return result == "undefined" ? null : result
}