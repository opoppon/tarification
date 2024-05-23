import * as React from "react";
import FormInput from "../components/formInput";
import { ActionArgs, ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { zfd } from "zod-form-data";
import { z } from "zod"
import SubmitButton from "../components/formSubmit";
import { NavLink, useActionData, useLoaderData, useSearchParams } from "@remix-run/react";
import { TarifRequest } from "../models/TarifRequest";
import SelectInput from "../components/formSelect";
import { KeyValue } from "../models/KeyValue";
import { Agency, loadAsAgencies } from "../models/Agency";
import { loadAsKeyValue } from "~/models/Product";


type LoaderData = {
	countries: KeyValue[],
	date: string,
	agencies: Agency[],
	products: KeyValue[],
}

const validator = withZod(z.object({
	shippingDate: zfd.text(z.string()),
	weight: zfd.numeric(z.number().min(0)),
	nbUM: zfd.numeric(z.number().min(0)),
	nbPalette: zfd.text(z.string().optional()),
	zipcodeFrom: zfd.text(z.string()),
	townFrom: zfd.text(z.string().optional()),
	countryFrom: zfd.text(z.string()),
	zipcodeTo: zfd.text(z.string()),
	townTo: zfd.text(z.string().optional()),
	countryTo: zfd.text(z.string()),
	agencyCode: zfd.text(z.string()),
	productCode: zfd.text(z.string().optional()),
	isPickup: zfd.text(z.string().optional())
}))

const badRequest = (data: TarifRequest) => json(data, { status: 400 })

export default function Index() {
	const data = useActionData()
	const { countries, date, agencies, products } = useLoaderData() as LoaderData

	const [isPickup, setIsPickup] = React.useState(false);
	const defaultAgency = agencies[0]
	const [selectedAgencyCode, setSelectedAgencyCode] = React.useState(defaultAgency.code)

	const [platformZipcode, setPlatformZipcode] = React.useState(defaultAgency.zipcode)


	const [searchParams] = useSearchParams();

	const myShippingDate = searchParams.get("shippingDate") || date
	const myWeight = searchParams.get("weight") || "";	
	const myNbUM = searchParams.get("nbUM") || "";
	const myNbPalette = searchParams.get("nbPalette") || "";
	const myIsPickup = searchParams.get("isPickup") === "true" || isPickup
	const mySelectedAgencyCode = searchParams.get("agencyCode") || selectedAgencyCode
	const myProductCode = searchParams.get("productCode") || ""
	const myPlatformZipcode = searchParams.get("platformZipcode") || platformZipcode
	const myCountryFrom = searchParams.get("countryFrom") || "FR"
	const myZipcodeFrom = searchParams.get("zipcodeFrom") || ""
	const myTownFrom = searchParams.get("townFrom") || ""
	const myCountryTo = searchParams.get("countryTo") || "FR"
	const myZipcodeTo = searchParams.get("zipcodeTo") || ""	
	const myTownTo = searchParams.get("townTo") || ""

	const handlePickupChanged = () => {
		setIsPickup(!isPickup)
	}

	const handleAgencyChanged = (event: any) => {
		const found = agencies.find(x => x.code == event.target.value)
		const code = found === undefined ? "" : found.zipcode

		setPlatformZipcode(code)
	}

	const agenciesKV = agencies.map( x => {
        return {
            key: x.code,
            value: x.name,
        }
    })

	return (
		<>
		<span className="bg-black bg-gradient text-white h1 px-5 py-1">Votre expédition</span>	
		<ValidatedForm
			method="post"
			validator={validator}
			className="bg-secondary bg-gradient p-3"
		>
			<div className="row mb-3">
				<div className="col-md-2">
					<label className="form-label">Date d'Expédition *</label>
					<input type="date" name="shippingDate" className="form-control" required defaultValue={myShippingDate} />
				</div>
				<div className="col-md-3">
					<div className="form-check form-switch">
						<input type="checkbox" name="isPickup" className="form-check-input" 
							defaultChecked={myIsPickup} onChange={handlePickupChanged}/>
						<label className="form-check-label">Est-ce un enlèvement ?</label>
					</div>
				</div>
			</div>
			<div className="row mb-3">
				<div className="col-md-2">
				<label className="form-label">Plateforme de {myIsPickup ? ("reprise"):("dépose")}</label>
				<select name="agencyCode" className="form-select"
					defaultValue={mySelectedAgencyCode} 
					onChange={handleAgencyChanged}
				>
					{agenciesKV.map((item) =>
						<option value={item.key}>{item.value}</option>
					)}
				</select>
				</div>
				<div className="col-md-2">
					<SelectInput name="productCode" label="Code Produit" values={products} value={myProductCode} />
				</div>
			</div>
			<div className="row mb-3">
				<div className="col-md-1">
					<FormInput name="weight" label="Poids" value={myWeight} required />
				</div>
				<div className="col-md-1">
					<FormInput name="nbUM" label="Nb UM" value={myNbUM} required />
				</div>
				<div className="col-md-1">
					<FormInput name="nbPalette" label="Nb Palette" value={myNbPalette} />
				</div>
			</div>
			{isPickup ? (
			<div className="row mb-3">
				<div className="col-md-2">
					{/* <label htmlFor="zipcodeFrom" className="form-label">CP. Expéditeur</label>
					<input name="zipcodeFrom" className="form-control" 
						value={zipcodeFrom} required/> */}
					<FormInput name="zipcodeFrom" label="CP. Expéditeur" value={myZipcodeFrom} required={true}/>
				</div>
				<div className="col-md-2">
					<FormInput name="townFrom" label="Ville Expéditeur" value={myTownFrom}/>
				</div>
				<div className="col-md-2">
					<SelectInput name="countryFrom" label="Pays Expéditeur" value={myCountryFrom} values={countries}/>
				</div>
				<input type="hidden" name="zipcodeTo" value={myPlatformZipcode}/>
				<input type="hidden" name="countryTo" value="FR"/>
			</div>
			):(
				<>
				<div className="row mb-3">
					<div className="col-md-2">
						<FormInput name="zipcodeTo" label="CP. Destinataire" value={myZipcodeTo} required={true} />
					</div>
					<div className="col-md-2">
						<FormInput name="townTo" label="Ville Destinataire" value={myTownTo} required={true} />
					</div>
					<div className="col-md-2">
						<SelectInput name="countryTo" label="Pays Destinataire" value={myCountryTo} values={countries} />
					</div>
				</div>

				<input type="hidden" name="zipcodeFrom" value={myPlatformZipcode}/>
				<input type="hidden" name="countryFrom" value="FR"/>
				</>
			)}
			<div className="row mb-3">
				<div className="col-md-2">
					<SubmitButton label="Afficher le tarif" labelSubmitting="Requête en cours..." />
				</div>
			</div>
		</ValidatedForm>
		</>
	)
}

export const loader: LoaderFunction = async () => {
	const date = new Date().toISOString().split('T')[0]
	let agencies = loadAsAgencies()	

	let products = loadAsKeyValue()
	//products = toKeyValue(products)
	
	const countries: KeyValue[] = [
		{ key: "FR", value: "France" },
	]

	return json({
		countries,
		date,
		agencies,
		products,
	} as LoaderData)
}

export const action: ActionFunction = async ({ request }: ActionArgs) => {
	const result = await validator.validate(
		await request.formData()
	)

	if (result.error) {
		return validationError(result.error)
	}

	const data = result.data
	const params = Object.keys(data)
		.filter((key: any) => typeof data[key] != "undefined" )
		.map((key: any) => `${key}=${data[key]}`)
		.join("&")

	return redirect(`/tarif?${params}`)
}
