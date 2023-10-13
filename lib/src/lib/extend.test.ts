import { expect, test } from 'vitest'

import { create } from './create'
import { extend } from './extend'
import { CevaliError, TYPE } from './util'

test('"extend" should create an extended validator', () => {
  const string = create('string', TYPE.string)

  const email = string.create((value: string, opts: { message?: string } = {}) => {
    if (!value.includes('@'))
      throw new CevaliError(opts.message || 'Invalid email')
  })

  const extendedEmail = extend(email, (value: string, opts: { message?: string } = {}) => {
    if (!value.includes('.com'))
      throw new CevaliError(opts.message || 'Invalid email')
  })

  const validate = string([extendedEmail({ message: 'Wrong email' })])

  expect(() => validate('test')).toThrowError('Invalid email')
  expect(() => validate('test@test')).toThrowError()
  expect(() => validate('test@test.com')).not.toThrowError()
})

test('"extend" should create an extended validator with optional arguments', () => {
  const string = create('string', TYPE.string)

  const email = string.create((value: string, opts: { message?: string } = {}) => {
    if (!value.includes('@'))
      throw new CevaliError(opts.message || 'Invalid email')
  })

  const extendedEmail = extend(email, (value: string, blacklisted?: string[], opts: { message?: string } = {}) => {
    if (blacklisted?.includes(value))
      throw new CevaliError(opts.message || 'Blacklisted email')
  })

  const validate = string([extendedEmail(['blacklisted@test'])])

  expect(() => validate('test')).toThrowError('Invalid email')
  expect(() => validate('test@test')).not.toThrowError()
  expect(() => validate('blacklisted@test')).toThrowError('Blacklisted email')
})
