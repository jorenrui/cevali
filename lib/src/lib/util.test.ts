import { expect, test } from 'vitest'

import { create } from './create'
import { assertPipe, assertRequired, assertTypeof, CevaliError, isEmpty, TYPE } from './util'

test('Type should be a literal', () => {
  expect(TYPE.string).toBe('')
  expect(TYPE.number).toBe(0)
  expect(TYPE.boolean).toBe(true)
  expect(TYPE.object).toEqual({})
  expect(TYPE.array).toEqual([])
})

test('CevaliError should return an array of errors', () => {
  const errors = {
    name: new CevaliError('name is required'),
    age: new CevaliError('age is required')
  }
  const error = new CevaliError(null, errors)

  expect(error.message).toBe('There were 2 errors found')
  expect(error.errors).toBe(errors)

  const message = 'There were errors found'
  const error2 = new CevaliError(message, errors)

  expect(error2.message).toBe(message)
})

test('isEmpty should return true if value is empty', () => {
  expect(isEmpty('', TYPE.string)).toBe(true)
  expect(isEmpty({}, TYPE.object)).toBe(true)
  expect(isEmpty([], TYPE.array)).toBe(true)
  expect(isEmpty(null, TYPE.number)).toBe(true)
  expect(isEmpty(undefined, TYPE.number)).toBe(true)
  expect(isEmpty(NaN, TYPE.number)).toBe(true)
  expect(isEmpty(0, TYPE.number)).toBe(false)
  expect(isEmpty('test', TYPE.string)).toBe(false)
  expect(isEmpty({ test: 'test' }, TYPE.object)).toBe(false)
  expect(isEmpty([1], TYPE.array)).toBe(false)
  expect(isEmpty(1, TYPE.number)).toBe(false)
})

test('assertRequired should throw an error if value is empty', () => {
  expect(() => assertRequired('', TYPE.string)).toThrowError('Required')
  expect(() => assertRequired({}, TYPE.object)).toThrowError('Required')
  expect(() => assertRequired([], TYPE.array)).toThrowError('Required')
  expect(() => assertRequired(null, TYPE.number)).toThrowError('Required')
  expect(() => assertRequired(undefined, TYPE.number)).toThrowError('Required')
  expect(() => assertRequired(NaN, TYPE.number)).toThrowError('Invalid number')
  expect(() => assertRequired(0, TYPE.number)).not.toThrowError('Required')
  expect(() => assertRequired('test', TYPE.string)).not.toThrowError('Required')
  expect(() => assertRequired({ test: 'test' }, TYPE.object)).not.toThrowError('Required')
  expect(() => assertRequired([1], TYPE.array)).not.toThrowError('Required')
  expect(() => assertRequired(1, TYPE.number)).not.toThrowError('Required')
})

test('assertTypeof should throw an error if value is not the same type', () => {
  expect(() => assertTypeof('', TYPE.string)).not.toThrowError()
  expect(() => assertTypeof({}, TYPE.object)).not.toThrowError()
  expect(() => assertTypeof([], TYPE.array)).not.toThrowError()
  expect(() => assertTypeof(null, TYPE.number)).not.toThrowError()
  expect(() => assertTypeof(undefined, TYPE.number)).not.toThrowError()
  expect(() => assertTypeof(NaN, TYPE.number)).not.toThrowError()
  expect(() => assertTypeof(0, TYPE.number)).not.toThrowError()
  expect(() => assertTypeof('test', TYPE.string)).not.toThrowError()
  expect(() => assertTypeof({ test: 'test' }, TYPE.object)).not.toThrowError()
  expect(() => assertTypeof([1], TYPE.array)).not.toThrowError()
  expect(() => assertTypeof(1, TYPE.number)).not.toThrowError()
  expect(() => assertTypeof(1, TYPE.string)).toThrowError('Expected string but got number')
  expect(() => assertTypeof('test', TYPE.number)).toThrowError('Expected number but got string')
  expect(() => assertTypeof('test', TYPE.object)).toThrowError('Expected object but got string')
  expect(() => assertTypeof('test', TYPE.array)).toThrowError('Expected array but got string')
  expect(() => assertTypeof(1, TYPE.object)).toThrowError('Expected object but got number')
  expect(() => assertTypeof(1, TYPE.array)).toThrowError('Expected array but got number')
  expect(() => assertTypeof({}, TYPE.string)).toThrowError('Expected string but got object')
  expect(() => assertTypeof({}, TYPE.number)).toThrowError('Expected number but got object')
  expect(() => assertTypeof({}, TYPE.array)).toThrowError('Expected array but got object')
  expect(() => assertTypeof([], TYPE.string)).toThrowError('Expected string but got array')
  expect(() => assertTypeof([], TYPE.number)).toThrowError('Expected number but got array')
  expect(() => assertTypeof([], TYPE.object)).toThrowError('Expected object but got array')
})

test('assertPipe should throw an error if value is not the same type', () => {
  const string = create('string', TYPE.string)
  const date = create('date', new Date(), (value) => {
    if (typeof value === 'string' || typeof value === 'number')
      return new Date(value)

    throw new CevaliError('Invalid date')
  })

  const email = string.create((value: string, message?: string) => {
    if (!value.includes('@'))
      throw new CevaliError(message || 'Invalid email1')
  })

  const today = date.create((value: Date, message?: string) => {
    if (value > new Date())
      throw new CevaliError(message || 'Invalid date')
  })

  expect(() => assertPipe(email, string.schema)).not.toThrowError()
  expect(() => assertPipe(email, date.schema)).toThrowError()
  expect(() => assertPipe(today, date.schema)).not.toThrowError()
  expect(() => assertPipe(today, string.schema)).toThrowError()
})
