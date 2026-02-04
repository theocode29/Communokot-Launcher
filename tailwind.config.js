/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/renderer/**/*.{html,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                'display': ['Inter', 'system-ui', 'sans-serif'], // Keeping Inter for now, can switch to Unbounded if font file added
                'ui': ['Inter', 'system-ui', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            colors: {
                // Backgrounds
                'deep': '#0a0a0c',
                'surface': '#131316',

                // Brand
                'brand': {
                    'primary': '#fbbf24', // Amber 400
                    'glow': 'rgba(251, 191, 36, 0.5)',
                },
                'action': {
                    'blue': '#3b82f6', // Blue 500
                },

                // Text
                'text': {
                    'main': '#ffffff',
                    'muted': '#a1a1aa', // Zinc 400
                },

                // Utilities
                'white-10': 'rgba(255, 255, 255, 0.1)',
                'white-5': 'rgba(255, 255, 255, 0.05)',
                'error': '#ef4444',
            },
            // Custom Easing for "Organic" feel
            transitionTimingFunction: {
                'organic': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            // Custom Spacing/Sizing
            letterSpacing: {
                'widest-tech': '0.2em',
                'tighter-loud': '-0.05em',
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
};
