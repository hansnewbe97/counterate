
export const CURRENCY_DATA: Record<string, { name: string; flag: string; countryCode: string }> = {
    USD: { name: "US Dollar", flag: "🇺🇸", countryCode: "us" },
    EUR: { name: "Euro", flag: "🇪🇺", countryCode: "eu" },
    GBP: { name: "British Pound", flag: "🇬🇧", countryCode: "gb" },
    SGD: { name: "Singapore Dollar", flag: "🇸🇬", countryCode: "sg" },
    AUD: { name: "Australian Dollar", flag: "🇦🇺", countryCode: "au" },
    JPY: { name: "Japanese Yen", flag: "🇯🇵", countryCode: "jp" },
    CNY: { name: "Chinese Yuan", flag: "🇨🇳", countryCode: "cn" },
    HKD: { name: "Hong Kong Dollar", flag: "🇭🇰", countryCode: "hk" },
    MYR: { name: "Malaysian Ringgit", flag: "🇲🇾", countryCode: "my" },
    THB: { name: "Thai Baht", flag: "🇹🇭", countryCode: "th" },
    KRW: { name: "South Korean Won", flag: "🇰🇷", countryCode: "kr" },
    SAR: { name: "Saudi Riyal", flag: "🇸🇦", countryCode: "sa" },
    CAD: { name: "Canadian Dollar", flag: "🇨🇦", countryCode: "ca" },
    CHF: { name: "Swiss Franc", flag: "🇨🇭", countryCode: "ch" },
    NZD: { name: "New Zealand Dollar", flag: "🇳🇿", countryCode: "nz" },
    IDR: { name: "Indonesian Rupiah", flag: "🇮🇩", countryCode: "id" },
    VND: { name: "Vietnamese Dong", flag: "🇻🇳", countryCode: "vn" },
    INR: { name: "Indian Rupee", flag: "🇮🇳", countryCode: "in" },
    PHP: { name: "Philippine Peso", flag: "🇵🇭", countryCode: "ph" },
    TWD: { name: "New Taiwan Dollar", flag: "🇹🇼", countryCode: "tw" },
    AED: { name: "UAE Dirham", flag: "🇦🇪", countryCode: "ae" },
    MOP: { name: "Macanese Pataca", flag: "🇲🇴", countryCode: "mo" },
    BND: { name: "Brunei Dollar", flag: "🇧🇳", countryCode: "bn" },
};

export function getCurrencyDetails(code: string) {
    const upperCode = code.toUpperCase().trim();

    // 1. Check static map
    if (CURRENCY_DATA[upperCode]) return CURRENCY_DATA[upperCode];

    // 2. Derive Country Code
    const derivedCountryCode = upperCode.length >= 2 ? upperCode.slice(0, 2).toLowerCase() : "";

    // Dynamic Flag Generation (Emoji fallback)
    let flagEmoji = "🏳️";
    if (derivedCountryCode && /^[a-z]{2}$/.test(derivedCountryCode)) {
        flagEmoji = derivedCountryCode
            .toUpperCase()
            .split('')
            .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
            .join('');
    }

    return {
        name: upperCode,
        flag: flagEmoji,
        countryCode: derivedCountryCode
    };
}
