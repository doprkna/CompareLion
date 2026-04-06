/**
 * ConditionalNav - Only renders the global navigation on appropriate pages
 *
 * Pages with their own navigation (landing, login, signup, etc.) should not
 * display the global nav to prevent overlapping headers.
 *
 * v0.35.9 - Landing page has its own nav, so global nav is hidden there
 */
export declare function ConditionalNav(): import("react").JSX.Element | null;
