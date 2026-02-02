/**
 * Centralized breakpoint constants for media queries
 * These values should match the breakpoints used in MainLayout and other components
 */

// Main layout breakpoint: controls when to show sidebar vs header
// >= this value: Desktop layout with sidebar
// < this value: Mobile layout with header
export const BREAKPOINT_DESKTOP = 800;

// Secondary breakpoint for component-level adjustments
// Used for spacing and sizing adjustments in components
export const BREAKPOINT_TABLET = 650;

/**
 * Media query strings for use with useMediaQuery hook
 */
export const MEDIA_QUERY_DESKTOP = `(min-width: ${BREAKPOINT_DESKTOP}px)`;
export const MEDIA_QUERY_TABLET = `(min-width: ${BREAKPOINT_TABLET}px)`;
export const MEDIA_QUERY_IS_MOBILE = `(max-width: ${BREAKPOINT_TABLET}px)`;
export const MEDIA_QUERY_IS_MOBILE_OR_TABLET = `(max-width: ${BREAKPOINT_DESKTOP}px)`;
