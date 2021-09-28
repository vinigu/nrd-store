export default class Currency {
    static currencyThis(value){
        let intl = new Intl.NumberFormat([], { style: 'currency', currency: 'BRL', minimumFractionDigits: 2});
        return intl.format(value);
    }
}