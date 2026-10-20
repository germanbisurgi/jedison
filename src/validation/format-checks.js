// Native format checks, each returns true when the value is valid.
// Parsers instead of nested-quantifier regexes, those backtracked exponentially (issue #88).

const DATE = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/
const TIME = /^([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]+)?(?:(z)|([+-])([0-9]{2}):([0-9]{2}))$/i

function isLeapYear (year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function isDate (value) {
  const match = DATE.exec(value)

  if (!match) {
    return false
  }

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]
}

export function isTime (value) {
  const match = TIME.exec(value)

  if (!match) {
    return false
  }

  const [hour, minute, second] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const offsetHour = match[6] === undefined ? 0 : Number(match[6])
  const offsetMinute = match[7] === undefined ? 0 : Number(match[7])

  if (hour > 23 || minute > 59 || second > 60 || offsetHour > 23 || offsetMinute > 59) {
    return false
  }

  // a leap second is only valid at 23:59:60 UTC
  if (second === 60) {
    const sign = match[5] === '-' ? -1 : 1
    const utcMinutes = (hour * 60 + minute - sign * (offsetHour * 60 + offsetMinute) + 2880) % 1440

    return utcMinutes === 1439
  }

  return true
}

export function isDateTime (value) {
  const parts = value.split(/t/i)

  return parts.length === 2 && isDate(parts[0]) && isTime(parts[1])
}

export function isDuration (value) {
  const week = /^P[0-9]+W$/.test(value)
  const full = /^P(?:[0-9]+Y)?(?:[0-9]+M)?(?:[0-9]+D)?(?:T(?:[0-9]+H)?(?:[0-9]+M)?(?:[0-9]+S)?)?$/.test(value)

  return week || (full && value !== 'P' && !value.endsWith('T'))
}

export function isIpv4 (value) {
  const parts = value.split('.')

  return parts.length === 4 && parts.every((part) => /^(0|[1-9][0-9]{0,2})$/.test(part) && Number(part) <= 255)
}

export function isIpv6 (value) {
  let address = value
  let groupsNeeded = 8

  const lastColon = address.lastIndexOf(':')
  const tail = address.slice(lastColon + 1)

  if (tail.includes('.')) {
    if (!isIpv4(tail)) {
      return false
    }

    address = address.slice(0, lastColon + 1) + '0:0'
  }

  const halves = address.split('::')

  if (halves.length > 2) {
    return false
  }

  const toGroups = (half) => (half === '' ? [] : half.split(':'))
  const groups = halves.flatMap(toGroups)

  if (!groups.every((group) => /^[0-9a-fA-F]{1,4}$/.test(group))) {
    return false
  }

  if (halves.length === 2) {
    groupsNeeded = 7
    return groups.length <= groupsNeeded
  }

  return groups.length === groupsNeeded
}

export function isHostname (value) {
  if (value.length === 0 || value.length > 253) {
    return false
  }

  return value.split('.').every((label) => {
    const validChars = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)
    const reservedHyphens = label.slice(2, 4) === '--' && !/^xn--/i.test(label)

    return validChars && !reservedHyphens
  })
}

const URI_CHARS = /^(?:[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=]|%[0-9A-Fa-f]{2})*$/

function hasValidAuthority (rest) {
  if (!rest.startsWith('//')) {
    return true
  }

  const authority = rest.slice(2).split(/[/?#]/)[0]
  const host = authority.slice(authority.lastIndexOf('@') + 1)
  const userinfo = authority.slice(0, Math.max(authority.lastIndexOf('@'), 0))

  if (/[[\]@]/.test(userinfo)) {
    return false
  }

  const bracket = /^\[([^\]]*)\](?::[0-9]*)?$/.exec(host)

  if (bracket) {
    return isIpv6(bracket[1]) || /^v[0-9a-fA-F]+\.[A-Za-z0-9\-._~!$&'()*+,;=:]+$/.test(bracket[1])
  }

  return /^[^:[\]]*(?::[0-9]*)?$/.test(host)
}

export function isUri (value) {
  const match = /^([A-Za-z][A-Za-z0-9+.-]*):(.*)$/s.exec(value)

  if (!match) {
    return false
  }

  const rest = match[2]
  const fragmentIndex = rest.indexOf('#')

  // a second "#" and "[" or "]" outside the authority are not allowed
  if (fragmentIndex !== -1 && rest.indexOf('#', fragmentIndex + 1) !== -1) {
    return false
  }

  return URI_CHARS.test(value) && hasValidAuthority(rest) && !/[[\]]/.test(rest.replace(/^\/\/[^/?#]*/, ''))
}

export function isUriReference (value) {
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) {
    return isUri(value)
  }

  // the first segment of a relative path cannot contain ":"
  if (/^[^/?#]*:/.test(value)) {
    return false
  }

  return isUri('x:' + (value.startsWith('//') ? value : value.replace(/^/, '')))
}

export function isUriTemplate (value) {
  return /^(?:[^{}\s]|\{[^{}\s]*\})*$/.test(value)
}

export function isJsonPointer (value) {
  return /^(?:\/(?:[^~/]|~[01])*)*$/.test(value)
}

export function isRelativeJsonPointer (value) {
  return /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~[01])*)*)$/.test(value)
}

export function isRegex (value) {
  try {
    new RegExp(value, 'u') // eslint-disable-line no-new
    return true
  } catch (error) {
    return false
  }
}

export const formatChecks = {
  date: isDate,
  time: isTime,
  'date-time': isDateTime,
  duration: isDuration,
  ipv4: isIpv4,
  ipv6: isIpv6,
  hostname: isHostname,
  uri: isUri,
  'uri-reference': isUriReference,
  'uri-template': isUriTemplate,
  'json-pointer': isJsonPointer,
  'relative-json-pointer': isRelativeJsonPointer,
  regex: isRegex
}
