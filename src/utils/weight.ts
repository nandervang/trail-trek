/**
 * Format a weight value in kilograms to a human-readable string
 * Converts to grams for weights under 1kg for better readability
 */
export function formatWeight(weightInKg: number): string {
  if (weightInKg >= 1) {
    return `${weightInKg.toFixed(2)} kg`;
  } else {
    const grams = weightInKg * 1000;
    return `${Math.round(grams)} g`;
  }
}

/**
 * Convert kilograms to grams
 */
export function kgToGrams(kg: number): number {
  return kg * 1000;
}

/**
 * Convert grams to kilograms
 */
export function gramsToKg(grams: number): number {
  return grams / 1000;
}

/**
 * Convert kilograms to ounces
 */
export function kgToOz(kg: number): number {
  return kg * 35.274;
}

/**
 * Convert ounces to kilograms
 */
export function ozToKg(oz: number): number {
  return oz / 35.274;
}