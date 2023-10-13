import { CevaliError, create } from './dist'

const date = create('date', new Date(), (value: unknown) => {
  if (typeof value !== 'string' && !(value instanceof Date))
    throw new CevaliError('Invalid date')

  return new Date(value)
})

const isToday = date.create((value: Date) => {
  const today = new Date()

  if (!(value.getUTCFullYear() === today.getUTCFullYear()
    && value.getUTCMonth() === today.getUTCMonth()
    && value.getUTCDate() === today.getUTCDate()))
    throw new CevaliError('Not 2023')
})

const validate = date([isToday()])

try {
  validate('2023-01-01')
} catch (error) {
  console.log(error.message)
}
