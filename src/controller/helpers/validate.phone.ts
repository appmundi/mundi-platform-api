export function ValidatePhone(phone) {
    phone = phone.replace(/\D/g, "")

    if (!(phone.length >= 10 && phone.length <= 11)) return false

    if (phone.length == 11 && parseInt(phone.substring(2, 3)) != 9) return false

    var codigosDDD = [
        11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34,
        35, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62,
        64, 63, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85,
        86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99
    ]

    if (codigosDDD.indexOf(parseInt(phone.substring(0, 2))) == -1) return false

    if (new Date().getFullYear() < 2017) return true
    if (
        phone.length == 10 &&
        [2, 3, 4, 5, 7].indexOf(parseInt(phone.substring(2, 3))) == -1
    )
        return false

    return true
}
