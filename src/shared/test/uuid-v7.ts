// No test runner import: Vitest helpers and Playwright specs both read this module.

/** A UUIDv7, as the device makes fact ids: unanchored, to sit inside a larger pattern. */
export const UUID_V7 = /[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/

/** A whole string that is one UUIDv7. */
export const ONLY_UUID_V7 = new RegExp(`^${UUID_V7.source}$`)
