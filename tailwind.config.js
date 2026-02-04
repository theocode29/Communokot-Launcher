/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/renderer/**/*.{html,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Couleurs d'accentuation pour la navigation (Swiss Brutalist)
                'tab-home': '#C4F623',      // Electric Lime
                'tab-map': '#3B82F6',       // Electric Blue
                'tab-updates': '#FF4500',   // International Orange
                'tab-settings': '#D946EF',  // Hot Pink/Fuchsia

                // Surfaces
                'surface': '#0D0D0D',
                'surface-light': '#1A1A1A',
                'surface-card': 'rgba(20, 20, 20, 0.85)',

                // Text
                'text-primary': '#FFFFFF',
                'text-secondary': '#A3A3A3',
                'text-muted': '#666666',

                // Status
                'status-online': '#22C55E',
                'status-offline': '#EF4444',
            },
            fontFamily: {
                'display': ['Inter', 'system-ui', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'brutalist': '4px 4px 0px 0px rgba(0,0,0,1)',
                'brutalist-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
                'glow-lime': '0 0 20px rgba(196, 246, 35, 0.3)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
