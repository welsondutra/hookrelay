/** Accepted shapes for a subscription pattern: `*`, `name`, `name.sub` or `name.*`. */
export const EVENT_TYPE_PATTERN = /^(\*|[a-z0-9][a-z0-9_.-]*(\.\*)?)$/i;

/**
 * Decides whether an endpoint should receive an event type.
 *
 * Patterns are exact names (`order.created`), a trailing wildcard on a
 * namespace (`order.*`) or `*` for everything. An empty list subscribes to all.
 */
export function matchesEventType(patterns: readonly string[], eventType: string): boolean {
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) return eventType.startsWith(pattern.slice(0, -1));
    return pattern === eventType;
  });
}
