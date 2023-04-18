import {Product} from './Product'

const removeBracket = (s: string) => {
	const index = s.indexOf("]")

	return s.substring(index + 1)
}

export default class TarifResponse {
	constructor(
		public productCode = "",
		public productName = "",
		public agenceCode = "",
		public grossAmount = 0.0,
		public netAmount = 0.0,
		public taxes:Tax[] = [],
	) {}

	static fromXML(xml: any, products: Product[]) {
		const tarif = new TarifResponse()

		tarif.productCode = xml.sCodeProduit._
		tarif.productName = removeBracket(xml.sLibelleProduit._)
		tarif.agenceCode = xml.sCodeAgence._
		tarif.grossAmount = xml.fMontantBrutHT._
		tarif.netAmount = xml.fMontantNetHT._

		const taxesXML = xml.tabListeTaxes.item
		if (taxesXML) {
			if (taxesXML.constructor === Array) {
				var taxes = taxesXML.map(Tax.fromXML)		
				taxes.sort((l,r) => l.rank - r.rank)
				tarif.taxes = taxes			
			}
			else {
				const t = Tax.fromXML(taxesXML)
				tarif.taxes.push(t)
			}	
		}

		return tarif
	}
}

export function getProductRank(code: string, products: Product[]): number {
	const found = products.find(x => x.code == code)
	return typeof found === "undefined" ? 100 : found.rank
}

export class Tax {	
	constructor(
		public name = "",
		public amount = 0.0,
		public amountBeforeInvoice = 0.0,
		public tarifCode:string = "",
		public rank: number = 100,
	){}

	static fromXML(xml:any) {
		let tax = new Tax()
		tax.name = removeBracket(xml.sLibelleTaxe?._)
		tax.amount = xml.fMontant._
		tax.amountBeforeInvoice = xml.fMontantAvantPieds._
		tax.tarifCode = xml.sCodeTarif._

		tax.rank = Tax.findRank(tax.name)

		return tax 
	}

	static findRank(name: string): number {
		//pour trier les tax dans cet ordre
		const taxNames = ["REDEVANCE", "PAQ", "TRACTION", "DISTRIBUTION"]
		const first = name.trim().split(" ")

		var rank = taxNames.findIndex(x => first[0] == x)
	
		return rank >= 0 ? rank : Number.MAX_VALUE
	}
}
