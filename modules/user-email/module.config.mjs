/* eslint-disable */

export default {
  type: 'feature',
  order: 40, // Before user-ui (60) and user-api (50) just in case, though registry order doesn't strictly matter for templates
  vite: {
    optimizeDeps: {
      include: [],
    },
  },
  theme: {
    extend: {
      colors: {
        email: {
          // Semantic colors for emails
          bg: '#ffffff',
          text: '#0e1726',
          'text-muted': '#666666',
          border: '#eaeaea',

          // Button colors
          'btn-bg': '#000000',
          'btn-text': '#ffffff',

          // Brand/Accent
          accent: '#3b82f6', // blue-500
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Ubuntu',
          'sans-serif',
        ],
      },
    },
  },
};
