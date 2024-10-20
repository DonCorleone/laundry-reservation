module.exports = {
  important: true,
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'bleu-ceruleen-pale': 'rgb(198, 213, 204)',
        'terre-ombre-brule': 'rgb(76, 66, 61)',
        'vert-59': 'rgb(66, 143, 112)',
        'rouge-rubia': 'rgb(148, 58, 77)',
        'vert-clair': 'rgb(171, 193, 122)',
        'gris-fonce': 'rgb(94, 96, 97)',
        'rose-clair': 'rgb(214, 175, 166)',
        'bleu-outremer-31': 'rgb(77, 106, 168)',
        'bleu-cerelueen-31': 'rgb(62, 110, 144)',
        'blanc': 'rgb(234, 219, 192)',
        'gris-31': 'rgb(146, 148, 148)',
        'gris-clair-31': 'rgb(188, 187, 182)',
        'rouge-vermillont': 'rgb(155, 55, 56)',
        'rouge-carmin': 'rgb(143, 58, 67)',
        'vert-31': 'rgb(127, 162, 90)',
        'vert-fonce': 'rgb(62, 111, 66)',
        'vert-anglais': 'rgb(64, 110, 88)',
        'vert-anglais-claire': 'rgb(145, 175, 161)',
        'vert-anglais-pale': 'rgb(190, 203, 183)',
        'vert-jaune-clair': 'rgb(196, 211, 155)',
        'ocre': 'rgb(234, 207, 166)',
        'ocre-rouge-moyen': 'rgb(205, 152, 134)',
        'ocre-rouge-claire': 'rgb(219, 190, 170)',
        'ocre-rouge': 'rgb(139, 77, 62)',
        'terre-sienne-claire': 'rgb(216, 178, 154)',
        'terre-sienne-claire-31': 'rgb(219, 190, 170)',
        'terre-sienne-brique': 'rgb(182, 123, 102)',
        'terre-sienne-brule': 'rgb(104, 68, 60)',
        'ombre-naturelle-clair': 'rgb(90, 85, 80)',
        'ombre-brule-clair': 'rgb(183, 163, 146)',
        'orange-clair': 'rgb(220, 141, 103)',
        'orange-pale': 'rgb(234, 207, 185)',
        'ceruleen-moyen': 'rgb(138, 181, 186)',
        'rose-pale': 'rgb(230, 205, 191)',
        'ceruleen-clair': 'rgb(168, 196, 193)',
        'outremer-pale': 'rgb(182, 198, 206)',
        'outremer-moyen': 'rgb(143, 171, 201)',
        'outremer-clair': 'rgb(171, 189, 200)',
        'outremer-gris':'rgb(198, 213, 204)'
      },
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
