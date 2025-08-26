/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#334155',
            h1: {
              color: '#1e293b',
              fontWeight: '600',
            },
            h2: {
              color: '#1e293b',
              fontWeight: '600',
            },
            h3: {
              color: '#1e293b',
              fontWeight: '600',
            },
            strong: {
              color: '#1e293b',
              fontWeight: '600',
            },
            code: {
              color: '#1e293b',
              backgroundColor: '#f1f5f9',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            pre: {
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1rem',
            },
            blockquote: {
              borderLeftColor: '#e2e8f0',
              color: '#64748b',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
