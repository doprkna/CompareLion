/**
 * useTheme Hook
 * v0.34.5 - Theme management with localStorage persistence
 */
'use client';
import { useState, useEffect, useCallback } from 'react';
const DEFAULT_THEME = 'auto';
const THEMES = [
    { name: 'light', label: 'Light', colors: { primary: '#000', background: '#fff', text: '#000' } },
    { name: 'dark', label: 'Dark', colors: { primary: '#fff', background: '#000', text: '#fff' } },
    { name: 'auto', label: 'Auto', colors: { primary: '#000', background: '#fff', text: '#000' } },
];
function getStoredTheme() {
    if (typeof window === 'undefined')
        return DEFAULT_THEME;
    const stored = localStorage.getItem('theme');
    return stored && ['light', 'dark', 'auto'].includes(stored) ? stored : DEFAULT_THEME;
}
function setStoredTheme(theme) {
    if (typeof window === 'undefined')
        return;
    localStorage.setItem('theme', theme);
}
function applyTheme(theme) {
    if (typeof window === 'undefined')
        return;
    const root = document.documentElement;
    const effectiveTheme = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
    root.setAttribute('data-theme', effectiveTheme);
}
function getThemeConfig(theme) {
    return THEMES.find(t => t.name === theme) || THEMES[0];
}
function getAllThemes() {
    return THEMES;
}
function getNextTheme(currentTheme) {
    const index = THEMES.findIndex(t => t.name === currentTheme);
    const nextIndex = (index + 1) % THEMES.length;
    return THEMES[nextIndex].name;
}
/**
 * Hook for theme management
 */
export function useTheme() {
    const [theme, setThemeState] = useState(DEFAULT_THEME);
    // Initialize theme from localStorage
    useEffect(() => {
        const stored = getStoredTheme();
        setThemeState(stored);
        applyTheme(stored);
    }, []);
    // Set theme and persist to localStorage
    const setTheme = useCallback((newTheme) => {
        setThemeState(newTheme);
        setStoredTheme(newTheme);
        applyTheme(newTheme);
    }, []);
    // Toggle to next theme
    const toggleTheme = useCallback(() => {
        const next = getNextTheme(theme);
        setTheme(next);
    }, [theme, setTheme]);
    return {
        theme,
        themeConfig: getThemeConfig(theme),
        setTheme,
        toggleTheme,
        availableThemes: getAllThemes(),
    };
}
