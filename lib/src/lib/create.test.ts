import { expect, test } from 'vitest'

import { create, object } from './create'
import { CevaliError, TYPE } from './util'

test('"create" should create a schema', () => {
  const string = create('string', TYPE.string)

  expect(string.type).toBe('schema')
  expect(string.schema).toBe('string')
  expect(string.pipeType).toBe('array')
  expect(string.displayName).toBe('Unknown Schema')
  string.displayName = 'string'
  expect(string.displayName).toBe('string')
})

test('pipes should be optional', () => {
  const string = create('string', TYPE.string)
  const validate = string([], false)

  expect(validate.required).toBe(false)
  expect(() => validate('')).not.toThrowError()
  expect(() => validate('test')).not.toThrowError()
})

test('validating a schema with a pipe', () => {
  const string = create('string', TYPE.string)
  const email = string.create((value: string, message?: string) => {
    if (!value.includes('@'))
      throw new CevaliError(message || 'Invalid email1')
  })

  expect(email.type).toBe('pipe')
  expect(email.schema).toBe('string')
  expect(email.displayName).toBe('Unknown Validator')
  email.displayName = 'email'
  expect(email.displayName).toBe('email')

  const emailValidator = email()

  expect(typeof emailValidator).toBe('function')
  expect(emailValidator.type).toBe('validator')
  expect(emailValidator.schema).toBe('string')
  expect(emailValidator.displayName).toBe('email')
  expect(() => emailValidator('test')).toThrowError('Invalid email')

  const validate = string([email()])

  expect(validate.required).toBe(true)
  expect(validate.type).toBe('validator')
  expect(validate.schema).toBe('string')
  expect(validate.displayName).toBe('Unknown Validator')
  validate.displayName = 'validate'
  expect(validate.displayName).toBe('validate')
})

test('validating a schema with multiple pipes', () => {
  const string = create('string', TYPE.string)
  const email = string.create((value: string, message?: string) => {
    if (!value.includes('@'))
      throw new CevaliError(message || 'Invalid email')
  })

  const blocklisted = string.create((value: string, blocklisted: string[]) => {
    if (blocklisted.includes(value))
      throw new CevaliError('Blocklisted email')
  })

  const validate = string([email(), blocklisted(['test@example.com', 'test2@example.com'])])

  expect(validate.type).toBe('validator')
  expect(validate.schema).toBe('string')
  expect(() => validate('what')).toThrowError('Invalid email')
  expect(() => validate('test@example.com')).toThrowError('Blocklisted email')
  expect(() => validate('normal@email.com')).not.toThrowError()
})

test('schema should convert custom types', () => {
  const date = create('date', new Date(), (value: unknown) => {
    if (typeof value !== 'string' && !(value instanceof Date))
      throw new CevaliError('Invalid date')

    return new Date(value)
  })

  const today = date.create((value: Date) => {
    if (value.getFullYear() === 2023)
      throw new CevaliError('Not 2023')
  })
  const yesterday = date.create((value: Date) => {
    if (value.getFullYear() === 2021)
      throw new CevaliError('Not 2021')
  })

  const validate = date([today(), yesterday()])

  expect(() => validate(new Date())).toThrowError('Not 2023')
  expect(() => validate('2024-10-01')).not.toThrowError()
})

test('validating an object schema', () => {
  const string = create('string', TYPE.string)
  const email = string.create((value: string, message?: string) => {
    if (!value.includes('@'))
      throw new CevaliError(message || 'Invalid email')
  })
  const minLength = string.create((value: string, min: number) => {
    if (value.length < min)
      throw new CevaliError(`Must be at least ${min} characters`)
  })

  const number = create('string', TYPE.number)
  const min = number.create((value: number, min: number) => {
    if (value < min)
      throw new CevaliError(`Must be at least ${min}`)
  })

  const validate = object({
    email: string([email()]),
    username: string([minLength(3)]),
    age: number([min(18)]),
    displayName: string([], false),
    numbers: object({
      one: number([min(1)]),
      two: number([min(2)])
    })
  })

  expect(validate.type).toBe('object')
  expect(validate.required).toBe(true)
  expect(validate.displayName).toBe('Unknown Validator')
  validate.displayName = 'validate'
  expect(validate.displayName).toBe('validate')
  expect(typeof validate.schema).toBe('object')
  if (typeof validate.schema !== 'object') return

  expect(validate.schema.email).toBe('string')
  expect(validate.schema.username).toBe('string')
  expect(validate.schema.age).toBe('string')
  expect(validate.schema.displayName).toBe('string')
  expect(typeof validate.schema.numbers).toBe('object')
  if (typeof validate.schema.numbers !== 'object') return
  // @ts-expect-error
  expect(validate.schema.numbers.one).toBe('string')
  // @ts-expect-error
  expect(validate.schema.numbers.two).toBe('string')

  expect(() => validate({})).toThrowError('Required')
  expect(() => validate({ email: 'test' })).toThrowError('Missing property: username')
  expect(() => validate({ email: 'test', username: 'test' })).toThrowError('Missing property: age')
  expect(() => validate({
    email: 'test@example.com',
    username: 'test',
    age: 18,
    displayName: 'test',
    numbers: {
      one: 1,
      two: 2
    }
  })).not.toThrowError()
  try {
    validate({
      email: 'test.com',
      username: 'test',
      age: 17,
      displayName: 'test',
      numbers: {
        one: 1,
        two: 2
      }
    })
  } catch (ex) {
    expect(ex).toBeInstanceOf(CevaliError)
    expect(ex.message).toBe('There were 2 errors found')
    expect(ex.errors.email.message).toBe('Invalid email')
    expect(ex.errors.age.message).toBe('Must be at least 18')
  }
})
