export const ESTABLISHMENT_RADIUS_KM = 60
export const DEFAULT_HOME_SERVICE_RADIUS_KM = 60
export const MAX_SANE_RADIUS_KM = 500

const EARTH_RADIUS_KM = 6378.137

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

export function haversineKm(
    startLatitude: number,
    startLongitude: number,
    endLatitude: number,
    endLongitude: number
): number {
    const dLat = toRadians(endLatitude - startLatitude)
    const dLon = toRadians(endLongitude - startLongitude)

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.sin(dLon / 2) ** 2 *
            Math.cos(toRadians(startLatitude)) *
            Math.cos(toRadians(endLatitude))

    return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a))
}

// `deslocation` é string livre no banco: "50", "null", "", texto.
export function parseServiceRadiusKm(
    deslocation?: string | null
): number | null {
    if (deslocation === null || deslocation === undefined) return null

    const match = /\d+([.,]\d+)?/.exec(String(deslocation))
    if (!match) return null

    const radius = Number(match[0].replace(",", "."))
    if (!Number.isFinite(radius) || radius <= 0 || radius > MAX_SANE_RADIUS_KM) {
        return null
    }

    return radius
}

// 0,0 é falha conhecida do geolocator, não uma posição no golfo da Guiné.
export function parseCoordinatePair(
    rawLat?: string,
    rawLng?: string
): { latitude: number; longitude: number } | null {
    if (!rawLat || !rawLng) return null

    const latitude = Number(rawLat)
    const longitude = Number(rawLng)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
    if (Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001) return null

    return { latitude, longitude }
}

export function hasUsableCoordinates(
    latitude?: number | null,
    longitude?: number | null
): boolean {
    if (latitude === null || latitude === undefined) return false
    if (longitude === null || longitude === undefined) return false
    return !(Math.abs(latitude) < 0.0001 && Math.abs(longitude) < 0.0001)
}
