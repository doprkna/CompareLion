import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			// Design Tokens v0.11.4 - Unified dark theme with WCAG AA compliance
  			bg: {
  				DEFAULT: '#0a0f1e', // Darker base for better contrast
  				elevated: '#1e293b', // Cards and elevated surfaces
  				muted: '#0f172a', // Subtle backgrounds
  			},
  			text: {
  				DEFAULT: '#f8fafc', // High contrast white
  				secondary: '#cbd5e1', // Medium contrast
  				muted: '#94a3b8', // Low contrast
  				disabled: '#64748b', // Disabled state
  			},
  			border: {
  				DEFAULT: '#334155', // Standard borders
  				light: '#475569', // Lighter borders
  				heavy: '#1e293b', // Darker borders
  			},
  			
  			// Keep shadcn/ui compatibility
  			background: '#0a0f1e',
  			foreground: '#f8fafc',
  			input: '#334155',
  			ring: '#3b82f6',
  			
  			primary: {
  				DEFAULT: '#3b82f6', // Blue - WCAG AA compliant
  				hover: '#2563eb',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				DEFAULT: '#475569',
  				hover: '#64748b',
  				foreground: '#f8fafc'
  			},
  			destructive: {
  				DEFAULT: '#ef4444', // Brighter red for better contrast
  				hover: '#dc2626',
  				foreground: '#ffffff'
  			},
  			success: {
  				DEFAULT: '#22c55e', // Brighter green for contrast
  				hover: '#16a34a',
  				foreground: '#ffffff'
  			},
  			warning: {
  				DEFAULT: '#f59e0b', // Brighter orange for contrast
  				hover: '#d97706',
  				foreground: '#000000'
  			},
  			muted: {
  				DEFAULT: '#334155',
  				foreground: '#94a3b8'
  			},
  			accent: {
  				DEFAULT: '#3b82f6',
  				hover: '#2563eb',
  				foreground: '#ffffff'
  			},
  			popover: {
  				DEFAULT: '#1e293b',
  				foreground: '#f8fafc'
  			},
  			card: {
  				DEFAULT: '#1e293b',
  				foreground: '#f8fafc'
  			},
  		},
  		spacing: {
  			// Design Tokens v0.11.4
  			'xs': '0.5rem',    // 8px
  			'sm': '0.75rem',   // 12px
  			'base': '1rem',    // 16px
  			'md': '1.5rem',    // 24px
  			'lg': '2rem',      // 32px
  			'xl': '3rem',      // 48px
  			'2xl': '4rem',     // 64px
  			'3xl': '6rem',     // 96px
  		},
  		borderRadius: {
  			// Design Tokens v0.11.4
  			'xs': '0.125rem',  // 2px
  			'sm': '0.25rem',   // 4px
  			'base': '0.5rem',  // 8px
  			'md': '0.75rem',   // 12px
  			'lg': '1rem',      // 16px
  			'xl': '1.5rem',    // 24px
  			'2xl': '2rem',     // 32px
  			'full': '9999px',
  		},
  		boxShadow: {
  			// Design Tokens v0.11.4
  			'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  			'base': '0 2px 4px 0 rgb(0 0 0 / 0.15)',
  			'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  			'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  			'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  			'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  			'glow': '0 0 20px rgb(59 130 246 / 0.4)',
  			'glow-sm': '0 0 10px rgb(59 130 246 / 0.3)',
  			'glow-lg': '0 0 30px rgb(59 130 246 / 0.5)',
  			'glow-accent': '0 0 20px var(--accent)',
  			'glow-success': '0 0 20px rgb(34 197 94 / 0.4)',
  			'glow-warning': '0 0 20px rgb(245 158 11 / 0.4)',
  			'glow-destructive': '0 0 20px rgb(239 68 68 / 0.4)',
  		},
  		fontSize: {
  			// Design Tokens v0.11.4
  			'xs': ['0.75rem', { lineHeight: '1rem' }],
  			'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  			'base': ['1rem', { lineHeight: '1.5rem' }],
  			'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  			'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  			'2xl': ['1.5rem', { lineHeight: '2rem' }],
  			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  		},
  		animation: {
  			// Optimized animations v0.11.4
  			'spin-slow': 'spin 3s linear infinite',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'bounce-soft': 'bounce 2s ease-in-out infinite',
  			'shimmer': 'shimmer 3s linear infinite',
  			'glow': 'glow 2s ease-in-out infinite',
  			'float': 'float 3s ease-in-out infinite',
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  				'100%': { backgroundPosition: '0% 50%' },
  			},
  			glow: {
  				'0%, 100%': { boxShadow: '0 0 10px var(--glow-color, rgb(59 130 246 / 0.3))' },
  				'50%': { boxShadow: '0 0 30px var(--glow-color, rgb(59 130 246 / 0.5))' },
  			},
  			float: {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-10px)' },
  			},
  		},
  		transitionDuration: {
  			// Optimized durations v0.11.4
  			'fast': '100ms',
  			'normal': '200ms',
  			'slow': '300ms',
  		},
  		transitionTimingFunction: {
  			'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  		},
  	}
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
export default config





