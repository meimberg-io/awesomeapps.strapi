module.exports = {
  // dein bisheriges Setup
  overrides: [
    {
      files: ['src/types/generated/**/*.{ts,js}'],
      rules: {
        // Deaktiviert z. B. Warnungen über ungenutzte Variablen im generierten Code
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
        'no-empty-function': 'off',
        // weitere Regeln, die bei dir Probleme machen
      },
    },
  ],
};