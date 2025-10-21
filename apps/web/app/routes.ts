/**
 * Route Configuration
 * 
 * Note: Main navigation is now handled by NavLinks component.
 * This file is kept for backwards compatibility and programmatic routing.
 */

// Core user routes
export const coreRoutes = [
  { path: '/main', label: 'Home' },
  { path: '/flow-demo', label: 'Play' },
  { path: '/friends', label: 'Social' },
  { path: '/profile', label: 'Profile' },
];

// Info routes
export const infoRoutes = [
  { path: '/info/faq', label: 'FAQ' },
  { path: '/info/contact', label: 'Contact' },
  { path: '/info/terms', label: 'Terms of Service' },
  { path: '/info/privacy', label: 'Privacy Policy' },
];

// Admin routes
export const adminRoutes = [
  { path: '/reports', label: 'Reports' },
  { path: '/admin', label: 'Admin Panel' },
];

// All routes (for backwards compatibility)
export const routes = [
  { path: '/', label: 'Landing' },
  { path: '/login', label: 'Login' },
  { path: '/signup', label: 'Sign Up' },
  ...coreRoutes,
  { path: '/activity', label: 'Activity' },
  { path: '/leaderboard', label: 'Leaderboard' },
  { path: '/shop', label: 'Shop' },
  { path: '/tasks', label: 'Tasks' },
  { path: '/questions', label: 'Questions' },
  ...infoRoutes,
  ...adminRoutes,
  { path: '/changelog', label: 'Changelog' },
];
