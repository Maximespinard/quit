/** Whether the user asked for reduced motion: animated figures then show their target at once. */
export const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
