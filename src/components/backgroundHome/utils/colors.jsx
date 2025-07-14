/**
 * Gets the value of a custom CSS property
 * Uses getComputedStyle to get the actual value
 *
 * @param {string} property - CSS property name (e.g., '--bg-color')
 * @returns {string} - CSS property value
 */
export const getColors = (property) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim()
}

/**
 * Applies an opacity value to a color
 * Handles different color formats (hex, rgb, rgba)
 *
 * @param {string} color - Color in any format
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} - Color in rgba format with applied opacity
 */
export const applyOpacity = (color, opacity) => {
  // === ERROR HANDLING ===
  if (!color) return 'rgba(0,0,0,0)'

  // === EXISTING RGBA FORMAT ===
  // If already rgba, replace only the opacity
  if (color.startsWith('rgba')) {
    // Replace the last number before the closing parenthesis
    return color.replace(/[\d.]+\)$/g, `${opacity})`)
  }

  // === HEXADECIMAL FORMAT ===
  // Convert hex to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1) // Remove the #

    // Extract R, G, B components
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // === RGB FORMAT ===
  // Convert rgb to rgba
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
  }

  // === FALLBACK ===
  // Return color as-is if format not recognized
  return color
}

/**
 * Cache for converted colors
 * Avoids expensive recalculations on every frame
 */
const colorCache = new Map()

/**
 * Gets a CSS color with opacity, using cache
 * Optimizes performance by avoiding repeated recalculations
 *
 * @param {string} property - CSS property to retrieve
 * @param {number} opacity - Opacity to apply (default: 1)
 * @returns {string} - rgba color with applied opacity
 */
export const getCachedColor = (property, opacity = 1) => {
  // === CACHE KEY GENERATION ===
  // Unique key based on property and opacity
  const key = `${property}-${opacity}`

  // === CACHE CHECK ===
  if (!colorCache.has(key)) {
    // If not cached, calculate and store
    const baseColor = getColors(property)
    colorCache.set(key, applyOpacity(baseColor, opacity))
  }

  // === RETURN CACHED VALUE ===
  return colorCache.get(key)
}
