export type TarifRequest = {
    shippingDate: string
    weight: string
    nbUM: string
    nbPalette: string|null
    zipcodeFrom: string
    townFrom: string|null
    countryFrom: string
    zipcodeTo: string
    townTo: string|null
    countryTo: string
    productCode: string|null
    agencyCode: string
    tiersCode: string
    isPickup: string|null
}