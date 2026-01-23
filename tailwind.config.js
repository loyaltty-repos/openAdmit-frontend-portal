/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx,js,jsx}",
        "./components/**/*.{ts,tsx,js,jsx}",
        "./app/**/*.{ts,tsx,js,jsx}",
        "./src/**/*.{ts,tsx,js,jsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
          colors: {
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    primary: {
        DEFAULT: '#002B56',
        foreground: '#ffffff',
        50: '#f0f7ff',
        100: '#d7ebfe',
        200: '#b6d9fc',
        300: '#89bff5',
        400: '#5fa6ec',
        500: '#398ce0',
        600: '#2673c0',
        700: '#235990',
        800: '#1d4063',
        900: '#00264c',
        950: '#001429'
    },
    secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))'
    },
    destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))'
    },
    muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))'
    },
    accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))'
    },
    popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))'
    },
    card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))'
    },
    sidebar: {
        DEFAULT: 'hsl(var(--sidebar-background))',
        foreground: 'hsl(var(--sidebar-foreground))',
        primary: 'hsl(var(--sidebar-primary))',
        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        accent: 'hsl(var(--sidebar-accent))',
        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        border: 'hsl(var(--sidebar-border))',
        ring: 'hsl(var(--sidebar-ring))'
    }
},
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            perspective: {
                '1000': '1000px',
                '1500': '1500px',
                '2000': '2000px',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(50px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'spin-slow': {
                    '0%': { transform: 'rotateX(15deg) rotateY(0deg)' },
                    '100%': { transform: 'rotateX(15deg) rotateY(360deg)' }
                },
                'globe-flight': {
                    '0%': {
                        left: '31%',
                        top: '50%',
                        transform: 'translateY(-50%) rotate(0deg) scale(0.8)',
                        opacity: '0'
                    },
                    '10%': { opacity: '1' },
                    '25%': {
                        left: '45%',
                        top: '35%',
                        transform: 'translateY(-50%) rotate(25deg) scale(1)'
                    },
                    '50%': {
                        left: '65%',
                        top: '30%',
                        transform: 'translateY(-50%) rotate(45deg) scale(1.1)'
                    },
                    '75%': {
                        left: '68%',
                        top: '25%',
                        transform: 'translateY(-50%) rotate(60deg) scale(1)'
                    },
                    '90%': { opacity: '1' },
                    '100%': {
                        left: '70%',
                        top: '20%',
                        transform: 'translateY(-50%) rotate(75deg) scale(0.8)',
                        opacity: '0'
                    }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.6s ease-out',
                'slide-in-right': 'slide-in-right 0.6s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'spin-slow': 'spin-slow 20s linear infinite',
                'globe-flight': 'globe-flight 8s ease-in-out infinite'
            }
        }
    }
}
