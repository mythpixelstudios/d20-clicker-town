/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1115',
        panel: '#161a22',
        text: '#e6e7eb',
        muted: '#9aa3b2',
        gold: '#e1b866',
        purple: '#a892ff',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'float-up': 'floatUp 1s ease-out forwards',
        'flicker': 'flicker 1.5s ease-in-out infinite alternate',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s infinite',
        'level-up-pulse': 'levelUpPulse 2s ease-out forwards',
        'crafting-pulse': 'craftingPulse 2s ease-out forwards',
        'achievement-slide': 'achievementSlide 5s ease-out forwards',
        'achievement-rotate': 'achievementRotate 3s ease-in-out infinite',
        'legendary-glow': 'legendaryGlow 3s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'shake': 'shake 0.15s ease-in-out',
      },
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(0px)', opacity: '1' },
          '100%': { transform: 'translateY(-30px)', opacity: '0' },
        },
        flicker: {
          '0%': { transform: 'scale(1) rotate(-1deg)', filter: 'hue-rotate(0deg)' },
          '100%': { transform: 'scale(1.1) rotate(1deg)', filter: 'hue-rotate(10deg)' },
        },
        glow: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.1)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
        },
        levelUpPulse: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        craftingPulse: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        achievementSlide: {
          '0%': { transform: 'translateY(-200px)', opacity: '0' },
          '15%': { transform: 'translateY(0)', opacity: '1' },
          '85%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-200px)', opacity: '0' },
        },
        achievementRotate: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(-10deg) scale(1.1)' },
          '75%': { transform: 'rotate(10deg) scale(1.1)' },
        },
        legendaryGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(251, 191, 36, 0.3)' },
          '50%': { boxShadow: '0 0 10px rgba(236, 72, 153, 0.4)' },
        },
        slideIn: {
          'from': { transform: 'translateX(400px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        tooltipFadeIn: {
          'from': { opacity: '0', transform: 'translateY(-4px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        levelUpPulse: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '20%': { transform: 'scale(1.2)', opacity: '1' },
          '50%': { transform: 'scale(1)' },
          '80%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        craftingBounce: {
          '0%': { transform: 'translateY(100px) scale(0.5)', opacity: '0' },
          '30%': { transform: 'translateY(0) scale(1.1)', opacity: '1' },
          '45%': { transform: 'translateY(-20px) scale(1)' },
          '60%': { transform: 'translateY(0) scale(1)' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '0' },
        },
        achievementSlide: {
          '0%': { transform: 'translateY(-200px)', opacity: '0' },
          '15%': { transform: 'translateY(0)', opacity: '1' },
          '85%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-200px)', opacity: '0' },
        },
        achievementRotate: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '25%': { transform: 'rotate(-10deg) scale(1.1)' },
          '75%': { transform: 'rotate(10deg) scale(1.1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px) rotate(-2deg)' },
          '75%': { transform: 'translateX(4px) rotate(2deg)' },
        },
      },
      boxShadow: {
        'glow-gold': '0 0 10px rgba(225, 184, 102, 0.5)',
        'glow-purple': '0 0 10px rgba(168, 146, 255, 0.5)',
        'card': '0 6px 24px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}

