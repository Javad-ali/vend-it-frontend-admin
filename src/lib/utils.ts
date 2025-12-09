import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number, currency: string = 'KWD'): string {
  return `${currency} ${amount.toFixed(2)}`
}

/**
 * Format date using date-fns
 */
export function formatDate(date: string | Date, format: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateFnsFormat(dateObj, format)
  } catch {
    return 'Invalid date'
  }
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Debounce function to limit call frequency
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Get status badge variant based on status
 */
export function getStatusVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  const statusLower = status.toLowerCase()

  if (['active', 'completed', 'paid', 'success'].includes(statusLower)) {
    return 'default'
  }

  if (['inactive', 'cancelled', 'failed', 'suspended', 'expired'].includes(statusLower)) {
    return 'destructive'
  }

  if (['pending', 'processing'].includes(statusLower)) {
    return 'secondary'
  }

  return 'outline'
}

