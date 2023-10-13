import { ArraySchema, ObjectSchema, Pipe, Validator, ValidatorType } from './types'
import {
  assertObjectSchema,
  assertPipe,
  assertRequired,
  assertTypeof,
  CevaliError,
  getDataType,
  isEmpty,
  TYPE
} from './util'

function createPipe<T, V extends unknown[]>(fn: (value: T, ...args: V) => void) {
  const pipe: Pipe<T, V> = (...args: V) => {
    const validator: Validator<T> = (value: T) => fn(value, ...args)

    validator.schema = pipe.schema
    validator.displayName = pipe.displayName
    validator.type = 'validator'
    return validator
  }

  pipe.type = 'pipe'
  pipe.displayName = 'Unknown Validator'
  return pipe
}

export function create<Type>(type: ValidatorType, dataType: Type, convert?: (value: unknown) => Type) {
  type ArgType = typeof convert extends undefined ? Type : unknown
  if (!Object.keys(TYPE).includes(getDataType(dataType)) && typeof convert !== 'function')
    throw new CevaliError('A custom data type required a convert function.')

  const schema: ArraySchema<Type, ArgType> = (pipes, required = true) => {
    assertTypeof(pipes, TYPE.array, `${type} schema: pipes argument`)
    pipes?.forEach((fn) => assertPipe(fn, type, `Schema: ${type}`))

    const validator: Validator<ArgType> = (param) => {
      const value = (convert ? convert(param) : param) as Type

      if (required)
        assertRequired(value, dataType)
      else if (isEmpty(value, dataType))
        return true

      assertTypeof(value, dataType)

      pipes?.forEach((fn) => fn(value))
      return true
    }

    validator.schema = type
    validator.required = required
    validator.type = 'validator'
    validator.displayName = 'Unknown Validator'
    return validator
  }

  schema.pipeType = 'array'
  schema.type = 'schema'
  schema.displayName = 'Unknown Schema'
  schema.schema = type
  schema.create = (fn) => {
    const pipe = createPipe(fn)

    pipe.schema = type
    return pipe
  }
  return schema
}

function createObjectSchema() {
  const schema: ObjectSchema<unknown> = (object, required = true) => {
    assertTypeof(object, TYPE.object, 'Schema: object argument')
    const validator: Validator<typeof object> = (value) => {
      if (required)
        assertRequired(value, TYPE.object)
      else if (isEmpty(value, TYPE.object))
        return true

      assertTypeof(value, TYPE.object)
      assertObjectSchema(value, object)

      const errors: { [key: string]: Error } = {}
      const validate = (object: Record<string, unknown>, value) => {
        Object.entries(object).forEach(([key, fn]) => {
          const currentValue = value[key as keyof typeof object]

          if (typeof fn === 'object')
            return validate(fn as Record<string, unknown>, currentValue)
          if (typeof fn !== 'function')
            throw new CevaliError(`Schema: object argument: ${key} is not a function`)

          try {
            fn(currentValue)
          } catch (error: unknown) {
            if (error instanceof Error)
              errors[key] = error
            else
              throw error
          }
        })
      }

      validate(object, value)

      if (Object.keys(errors).length > 0)
        throw new CevaliError(null, errors)
    }
    const schema = () => {
      const clone = {}

      Object.entries(object).forEach(([key, value]) => {
        clone[key] = value.schema
      })
      return clone
    }

    validator.required = required
    validator.schema = schema()
    validator.type = 'object'
    validator.displayName = 'Unknown Validator'
    return validator
  }

  schema.pipeType = 'object'
  schema.schema = 'object'
  schema.type = 'schema'
  schema.displayName = 'Unknown Schema'
  return schema
}

export const object = createObjectSchema()
