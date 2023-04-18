import { TarifRequest } from "../models/TarifRequest";
import {parseString } from "xml2js"
import TarifResponse, { getProductRank } from "../models/TarifResponse";
import { SoapSettings } from "../models/SoapSettings";
import { Product } from "../models/Product";

export function getTarif(
    request:TarifRequest,
    soapSettings: SoapSettings,
	products: Product[],
):Promise<GetTarifResponse> {
    return new TarifService().getTarif(request, soapSettings, products)
}

export type GetTarifResponse = {
    tarifs: TarifResponse[]
    errors: string[]
}

//http://www32.teliway.com/appli/vgtra/ws/entrant/GestionPrixTransport/gestionPrixTransport.php
const mkQuery = (
    tarifRequest:TarifRequest,    
    soapSettings:SoapSettings,
) => `<?xml version="1.0"?>
<soapenv:Envelope 
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xsd="http://www.w3.org/2001/XMLSchema"
	xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
	xmlns:ges="${soapSettings.url}"
>
<soapenv:Header>
<ges:AuthentificationHeader xsi:type="ges:AuthentHdr">
${mkStringTag("sLogin", soapSettings.user)}
${mkStringTag("sPassword", soapSettings.password)}
</ges:AuthentificationHeader>
</soapenv:Header>
<soapenv:Body>
<ges:calculerPrixTransport soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <expedition>         
  ${tarifRequest.isPickup ? "<sTypePickup>R</sTypePickup>" : ""}
  ${mkDateTag("sDateEnvoi", tarifRequest.shippingDate)}
  ${mkStringTag("sCodeAgence",tarifRequest.agencyCode)}
  ${mkStringTag("sComptePayeur",tarifRequest.tiersCode)}			  
  ${mkStringTag("sCodeProduit",tarifRequest.productCode)}
  ${mkStringTag("sTypePort", "P")}
  ${mkStringTag("iNbUM",tarifRequest.nbUM)}
  ${mkStringTag("fPoids",tarifRequest.weight)}
  ${mkStringTag("sCodePaysExpediteur",tarifRequest.countryFrom)}
  ${mkStringTag("sCPExpediteur",tarifRequest.zipcodeFrom)}	  	  
  ${mkStringTag("sLocaliteExpediteur",tarifRequest.townFrom)}			    
  ${mkStringTag("sCodePaysDestinataire",tarifRequest.countryTo)}
  ${mkStringTag("sCPDestinataire",tarifRequest.zipcodeTo)}
  ${mkStringTag("sLocaliteDestinataire",tarifRequest.townTo)}			  
  </expedition>
</ges:calculerPrixTransport>
</soapenv:Body>
</soapenv:Envelope>
`

class TarifService {
	async getTarif(
		tarifRequest: TarifRequest,
		soapSettings: SoapSettings,
		products: Product[],
	):Promise<GetTarifResponse> {

		const query = mkQuery(tarifRequest, soapSettings)
		const response = await fetch(soapSettings.url, {
			method: "POST",
			headers: { "Content-Type": "text/xml;charset=UTF-8" },
            body: query
		})
		const content = await response.text()   
	 
		let myResponse:GetTarifResponse = {tarifs: [], errors: []};
        
		parseString(
			content, 
			{explicitArray:false},
			(err:any, text:any) => {
				let xmlPrices = text['SOAP-ENV:Envelope']['SOAP-ENV:Body']["ns1:calculerPrixTransportResponse"]["return"]["listePrixTransport"]["item"]        
				if (xmlPrices) {
					if (null == tarifRequest.productCode) {
						let tarifs: TarifResponse[] = xmlPrices.map((x: any) => TarifResponse.fromXML(x, products))
						tarifs = tarifs.sort((l,r) => {
							const rankL = getProductRank(l.productCode, products)
							const rankR = getProductRank(r.productCode, products)

							return rankL - rankR
						})

						myResponse = {
                            tarifs,
                            errors: []
                        }
					}
					else {
						const tarifsXML = xmlPrices.filter((x:any) => {
							return x.sCodeProduit._.toString().toLowerCase() == tarifRequest.productCode?.toString().toLowerCase()
						})
						myResponse = {
							tarifs: tarifsXML.map(TarifResponse.fromXML),
							errors: []
						}
					}			
				}
				else {
					const xmlErrors = text['SOAP-ENV:Envelope']['SOAP-ENV:Body']["ns1:calculerPrixTransportResponse"]["return"]["listeErreurs"]["item"]					
					const errorLabels = xmlErrors.map((x: any) => String(x.sLibelleErreur._))

					myResponse = {
                        tarifs: [],
                        errors: [...new Set(errorLabels)] //suppression des doublons
                    }                   
				}
			}
		)

		return myResponse
	}
}

const mkStringTag = (tag:string, value:string|null) => { 
	return !!value ? `<${tag}>${value}</${tag}>` : ""
}

const mkDateTag = (tag:string, value:string|null) => {
	const dateFmt = !!value ? value.replace(/-/g,"") : null
	
	return mkStringTag(tag, dateFmt)
}