import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
        fontFamily: { // Added fontFamily extension
            sans: ['var(--font-geist-sans)'],
            mono: ['var(--font-geist-mono)'],
        },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5)'
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
  			},
            // New social media colors
            instagram: '#E1306C', // Vibrant pink/red for Instagram
            facebook: '#1877F2', // Facebook Blue
            whatsapp: '#25D366', // WhatsApp Green
            youtube: '#FF0000', // YouTube Red
            tiktok: '#000000', // TikTok Black
            linkedin: '#0A66C2', // LinkedIn Blue
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
            '3xl': '1.5rem', // Existing
            '4xl': '2.5rem', // New: for more rounded corners
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
            'marquee': {
                '0%': { transform: 'translateX(100%)' },
                '100%': { transform: 'translateX(-100%)' },
            },
            'bounce-down': { // New keyframe for bouncing arrow
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(10px)' },
            },
            'spin-slow': { // Slower spin for the main icon
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' },
            },
            'spin-fast': { // Faster spin for the overlay icon
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(-360deg)' }, // Spin in opposite direction
            },
            'pulse-slow': { // Keyframe for slow background pulse
                '0%, 100%': { opacity: '0.2' },
                '50%': { opacity: '0.4' },
            },
            'pulse-fast': { // Keyframe for fast background pulse
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
            },
            'hover-pulse': { // Keyframe for subtle hover pulse
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
            },
            'continuous-pulse': { // New keyframe for continuous pulse
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' }, // Increased scale for more visibility
            },
            'blob-1': { // New keyframe for blob animation 1
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '33%': { transform: 'translate(40px, -60px) scale(1.1)' },
                '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
            },
            'blob-2': { // New keyframe for blob animation 2
                '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                '33%': { transform: 'translate(-50px, 70px) scale(0.95)' },
                '66%': { transform: 'translate(60px, -40px) scale(1.05)' },
            },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
            'marquee': 'marquee 15s linear infinite', // Adjusted duration for faster scroll
            'bounce-down': 'bounce-down 1.5s infinite', // New animation
            'spin-slow': 'spin-slow 8s linear infinite',
            'spin-fast': 'spin-fast 3s linear infinite',
            'pulse-slow': 'pulse-slow 10s ease-in-out infinite', // Animation for slow background pulse
            'pulse-fast': 'pulse-fast 5s ease-in-out infinite', // Animation for fast background pulse
            'hover-pulse': 'hover-pulse 0.3s ease-in-out', // New animation for subtle hover pulse
            'continuous-pulse': 'continuous-pulse 1.5s ease-in-out infinite', // Increased scale and decreased duration
            'blob-1': 'blob-1 14s ease-in-out infinite alternate', // New blob animation
            'blob-2': 'blob-2 17s ease-in-out infinite alternate-reverse', // New blob animation
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;