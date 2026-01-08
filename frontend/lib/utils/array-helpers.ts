/**
 * Shared utility functions for the frontend
 */

/**
 * Helper function to ensure a value is always an array
 * Handles string serialization issues from the database/API
 * 
 * @param value - The value to convert to an array (can be array, string, or undefined/null)
 * @returns An array of strings
 * 
 * @example
 * ensureArray(['a', 'b']) // => ['a', 'b']
 * ensureArray('a,b') // => ['a', 'b']
 * ensureArray('["a","b"]') // => ['a', 'b']
 * ensureArray(null) // => []
 * ensureArray(undefined) // => []
 */
export function ensureArray(value: string[] | string | undefined | null): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    // Handle comma-separated strings or JSON arrays
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : [value]
    } catch {
      return value.split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}
