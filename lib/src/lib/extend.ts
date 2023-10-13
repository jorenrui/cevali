import { Pipe, Validator } from './types'
import { CevaliError } from './util'

export function extend<Value, Args extends unknown[], ExtendedArgs extends unknown[]>(
  pipe: Pipe<Value, Args>,
  fn: (value: Value, ...args: ExtendedArgs) => void,
) {
  if (pipe.type !== 'pipe')
    throw new CevaliError(`Expected a pipe but got a ${pipe.type}`)

  const extendedPipe: Pipe<Value, ExtendedArgs> = (...args) => {
    const optionalArgs = typeof args.at(-1) === 'object' && !Array.isArray(args.at(-1))
      ? args.pop()
      : {}
    const initialArgs = [...args.slice(0, Object.keys(optionalArgs).length ? pipe.length : pipe.length - 1)]

    if (pipe.length !== initialArgs.length)
      initialArgs.push(optionalArgs)

    const initial = pipe(...initialArgs as Args)

    const extended: Validator<Value> = (value) => {
      initial(value)
      fn(value, ...args)
    }

    extended.schema = pipe.schema
    extended.displayName = pipe.displayName
    extended.type = 'validator'
    return extended
  }

  extendedPipe.type = 'pipe'
  extendedPipe.displayName = 'Unknown Validator'
  return extendedPipe
}
