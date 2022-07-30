module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bleu-ceruleen-pale': '#c6d5cc',
        'terre-ombre-brule': '#4c423d',
        'vert-59' : '#428f70',
        'rouge-rubia' : '#943a4d',
        'vert-clair' : '#abc17a'
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
