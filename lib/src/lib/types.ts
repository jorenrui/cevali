
export type ValidatorType = 'string' | 'number' | 'boolean' | 'object' | 'array' | (string & Record<never, never>)

export interface Validator<Value> {
  (value: Value): void;
  type?: ValidatorType;
  required?: boolean;
  displayName?: string;
  schema?: ValidatorType | { [key: string]: ValidatorType };
}

export interface Pipe<Value, Args extends unknown[]> {
  (...args: Args): Validator<Value>;
  type: 'pipe';
  displayName?: string;
  schema?: ValidatorType;
}

export type CreatePipe = <Value, Args extends unknown[]>
  (fn: (value: Value, ...args: Args) => void) => Pipe<Value, Args>

export interface BaseSchema {
  type: 'schema';
  pipeType: 'array' | 'object';
  displayName?: string;
  schema: ValidatorType;
}

export interface ArraySchema<PipeType, ValidatorType> extends BaseSchema {
  (pipes?: Validator<PipeType>[], required?: boolean): Validator<ValidatorType>;
  pipeType: 'array';
  create: CreatePipe;
}

export interface ObjectParam<Type> {
  [key: string]: (Validator<Type> | ObjectParam<Type>)
}

export interface ObjectSchema<Type> extends BaseSchema {
  (object?: ObjectParam<Type>, required?: boolean): Validator<Type>;
  pipeType: 'object';
}
