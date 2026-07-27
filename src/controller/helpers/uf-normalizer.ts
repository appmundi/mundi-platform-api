const VALID_UFS = new Set([
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
    "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
    "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
])

const NAME_TO_UF: Record<string, string> = {
    acre: "AC",
    alagoas: "AL",
    amapa: "AP",
    amazonas: "AM",
    bahia: "BA",
    ceara: "CE",
    "distrito federal": "DF",
    "espirito santo": "ES",
    goias: "GO",
    maranhao: "MA",
    "mato grosso": "MT",
    "mato grosso do sul": "MS",
    "minas gerais": "MG",
    para: "PA",
    paraiba: "PB",
    parana: "PR",
    pernambuco: "PE",
    piaui: "PI",
    "rio de janeiro": "RJ",
    "rio grande do norte": "RN",
    "rio grande do sul": "RS",
    rondonia: "RO",
    roraima: "RR",
    "santa catarina": "SC",
    "sao paulo": "SP",
    sergipe: "SE",
    tocantins: "TO"
}

const stripAccents = (value: string): string =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

export function toUf(raw?: string | null): string | null {
    if (!raw) return null

    const value = stripAccents(raw.trim().toLowerCase())
        .replace(/^state of\s+/, "")
        .replace(/^estado d[eoa]\s+/, "")
        .trim()

    if (!value) return null

    if (value.length === 2) {
        const candidate = value.toUpperCase()
        return VALID_UFS.has(candidate) ? candidate : null
    }

    return NAME_TO_UF[value] ?? null
}
