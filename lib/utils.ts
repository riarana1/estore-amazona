import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { OrderItem, ShippingAddress } from '@/types'
import { ZodError } from 'zod' // Import ZodError from zod

// Define a type for Mongoose ValidationError
interface MongooseValidationError extends Error {
  name: 'ValidationError'
  errors: {
    [key: string]: {
      message: string
      // Mongoose validation errors can have more properties like `kind`, `path`, `value`
      // but only `message` is used in the current `formatError` logic.
    }
  }
}

// Define a type for MongoDB duplicate key error (e.g., E11000 duplicate key error)
interface MongoDuplicateKeyError extends Error {
  code: 11000
  keyValue: Record<string, unknown>
}

// Define a union type for the error parameter
// ZodError is imported from 'zod'
export type FormattableError =
  | ZodError
  | MongooseValidationError
  | MongoDuplicateKeyError
  | Error

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : int
}

// PROMPT: [ChatGTP] create toSlug ts arrow function that convert text to lowercase,
// remove non-word, non-whitespace, non-hyphen characters, replace whitespace,
// trim leading hyphens and trim trailing hyphens

export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
})

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US')
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}

export const round2 = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100

export const generateId = () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join('')

export const formatError = (error: unknown): string => {
  if (error instanceof ZodError) {
    // Use instanceof for proper type narrowing with ZodError
    const fieldErrors = error.issues.map((issue) => {
      const errorMessage = issue.message
      return `${issue.path.join('.')}: ${errorMessage}` // Zod issues have path as array
    })
    return fieldErrors.join('. ')
  }

  if (typeof error === 'object' && error !== null) {
    // Handle Mongoose Validation Error
    if (
      'name' in error &&
      error.name === 'ValidationError' &&
      'errors' in error
    ) {
      const err = error as MongooseValidationError
      const fieldErrors = Object.keys(err.errors).map((field) => {
        return err.errors[field]?.message
      })
      return fieldErrors.filter(Boolean).join('. ')
    }

    // Handle MongoDB Duplicate Key Error
    if ('code' in error && error.code === 11000 && 'keyValue' in error) {
      const err = error as MongoDuplicateKeyError
      const duplicateField = Object.keys(err.keyValue)[0]
      return `${duplicateField} already exists`
    }
  }

  return error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : JSON.stringify(error)
}

export function calculateFutureDate(days: number) {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + days)
  return currentDate
}

export function getMonthName(yearAndMonth: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [year, monthNumber] = yearAndMonth.split('-')
  const date = new Date()
  date.setMonth(parseInt(monthNumber) - 1)
  return new Date().getMonth() === parseInt(monthNumber) - 1
    ? `${date.toLocaleString('default', { month: 'long' })} (ongoing)`
    : date.toLocaleString('default', { month: 'long' })
}

export function calculatePastDate(days: number) {
  const currentDate = new Date()
  currentDate.setDate(currentDate.getDate() - days)
  return currentDate
}

export function timeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0) // Set to 12:00 AM (next day)

  const diff = midnight.getTime() - now.getTime() // Difference in milliseconds
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { hours, minutes }
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }
  const dateOptions: Intl.DateTimeFormatOptions = {
    // weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  }
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  }
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions,
  )
  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions,
  )
  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions,
  )
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  }
}

export const calculateCartPrices = ({
  items,
  shippingAddress,
  deliveryDateIndex,
  availableDeliveryDates,
}: {
  items: OrderItem[]
  shippingAddress?: ShippingAddress
  deliveryDateIndex?: number
  availableDeliveryDates: {
    name: string
    daysToDeliver: number
    shippingPrice: number
    freeShippingMinPrice: number
  }[]
}) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  )

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ]

  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
          itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0),
  )

  return { itemsPrice, shippingPrice, taxPrice, totalPrice, deliveryDateIndex }
}

export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`
}
