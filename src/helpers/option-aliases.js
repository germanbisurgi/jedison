/**
 * Maps deprecated option names to their current canonical names.
 * Add entries here when renaming options to keep backwards compatibility.
 * Format: { 'oldName': 'newName' }
 */
export const OPTION_ALIASES = {
  enforceEnumDefault: 'enforceEnum'
}

/** Returns the canonical name, resolving any alias. */
export function resolveAlias (name) {
  return OPTION_ALIASES[name] ?? name
}

/** Returns all deprecated names that point to canonicalName. */
export function getAliasesFor (canonicalName) {
  return Object.keys(OPTION_ALIASES).filter(old => OPTION_ALIASES[old] === canonicalName)
}
