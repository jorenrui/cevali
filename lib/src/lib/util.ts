import { ObjectParam, Pipe, Validator, ValidatorType } from './types'

export class CevaliError extends Error {
  errors: { [key: string]: Error }

  constructor(message?: string | null, errors?: { [x: string]: Error },) {
    super(message)
    this.errors = errors ?? {}

    const totalErrors = this.total()

    if (message == null || message?.length === 0 && totalErrors)
      this.message = `There were ${totalErrors} errors found`
  }

  total() {
    return Object.keys(this.errors).length
  }
}

export const TYPE = {
  string: '',
  number: 0,
  boolean: true,
  object: {},
  array: [] as unknown[]
}

export function getDataType(value: unknown) {
  return typeof value === 'object'
    ? Array.isArray(value)
      ? 'array'
      : 'object'
    : typeof value
}

export function assertTypeof(actual: unknown, expected: unknown, label?: string): asserts actual is typeof expected {
  const trace = label ? `[${label}]:` : ''

  if (actual == null) return

  const actualType = getDataType(actual)
  const expectedType = getDataType(expected)

  if (actualType !== expectedType)
    throw new CevaliError(`${trace}Expected ${expectedType} but got ${actualType}`)
}

export function assertObjectSchema(
  actual: object,
  expected: ObjectParam<unknown>,
  label?: string,
): asserts actual is typeof expected {
  const trace = label ? `[${label}]:` : ''

  if (actual == null) return
  if (getDataType(actual) === 'array')
    throw new CevaliError(`${trace}Expected object but got an array`)

  const actualKeys = Object.keys(actual)
  const expectedKeys = Object.keys(expected)

  expectedKeys.forEach((key) => {
    const expectedValue = expected[key as keyof typeof expected]

    if (!actualKeys.includes(key) && expected[key].required)
      throw new CevaliError(`${trace}Missing property: ${key}`)

    const actualValue = actual[key as keyof typeof actual]

    if (typeof expectedValue === 'object' && !Array.isArray(expectedValue)) {
      if (typeof actualValue !== 'object' || Array.isArray(actualValue))
        throw new CevaliError(`${trace}Expected object but got a ${typeof actualValue}  for property ${key}`)

      assertObjectSchema(actualValue, expectedValue, `${trace}${key}`)
    }
  })
  actualKeys.forEach((key) => {
    if (!expectedKeys.includes(key))
      throw new CevaliError(`${trace}Unexpected property: ${key}`)

    const actualValue = actual[key as keyof typeof actual]
    const expectedValue = expected[key as keyof typeof expected]

    if (typeof expectedValue === 'object' && !Array.isArray(expectedValue)) {
      if (typeof actualValue !== 'object' || Array.isArray(actualValue))
        throw new CevaliError(`${trace}Expected object but got a ${typeof actualValue}  for property ${key}`)

      assertObjectSchema(actualValue, expectedValue, `${trace}${key}`)
    }
  })
}

export function assertRequired(value: unknown, type: unknown): asserts value is NonNullable<typeof value> {
  if (value == null) throw new CevaliError('Required')
  if (typeof value !== typeof type)
    throw new CevaliError(`Expected ${typeof type} but got ${typeof value}`)

  if (typeof type === 'string' && value !== '') return
  if (typeof type === 'number') {
    if (!Number.isNaN(value)) return
    throw new CevaliError('Invalid number')
  }
  if (typeof type === 'object') {
    if (Array.isArray(value) && value.length > 0) return
    if (!['Object', 'Array'].includes(value.constructor.name)
      && value.constructor.name === type.constructor.name)
      return
    if (Object.keys(value).length > 0) return
  }
  if (typeof type === 'boolean' && value != null) return
  throw new CevaliError('Required')
}

export function isEmpty(value: unknown, type: unknown): boolean {
  if (value == null) return true
  if (typeof value !== typeof type)
    throw new CevaliError(`Expected ${typeof type} but got ${typeof value}`)
  if (typeof type === 'number' && Number.isNaN(value)) return true
  if (typeof type === 'string' && value === '') return true
  if (typeof type === 'object' && Object.keys(value).length === 0) return true
  if (typeof type === 'object' && Array.isArray(value) && value.length === 0) return true
  return false
}

export function assertPipe<T>(
  fn: Validator<T>,
  schema: ValidatorType,
  label?: string,
): asserts fn is Pipe<T, unknown[]> {
  const trace = label ? `[${label}]:` : ''

  if (fn.schema !== schema)
    throw new CevaliError(
      `${trace}[Validator: ${fn.displayName || 'unknown'}]: Expected type of '${schema}' but got '${fn.schema}'`
    )
}
