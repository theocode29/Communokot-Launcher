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
                // Backgrounds (Sand/Light Theme)
                'deep': '#FDFCF5',   // Warm White / Pale Sand
                'surface': '#F4F1E1', // Beige / Sand Surface

                // Brand
                'brand': {
                    'primary': '#E6B325', // Deep Gold / Sand Accent
                    'glow': 'rgba(230, 179, 37, 0.5)',
                },
                'action': {
                    'blue': '#2563EB', // Blue 600 (Accessible on light)
                },

                // Text
                'text': {
                    'main': '#2C2A26',    // Dark Charcoal/Brown (High Contrast)
                    'muted': '#78716C',   // Stone 500
                },

                // Utilities (Adapted for Light Mode)
                'white-10': 'rgba(0, 0, 0, 0.08)', // actually black-10 now
                'white-5': 'rgba(0, 0, 0, 0.04)',  // actually black-5 now
                'error': '#DC2626',   // Red 600
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
