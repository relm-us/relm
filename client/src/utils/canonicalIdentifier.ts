/**
 * Helper functions
 */

export function canonicalIdentifier(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9\-]+/, "-");
}

