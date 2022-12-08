module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["prettier"],
  plugins: ["import", "@typescript-eslint/eslint-plugin", "unused-imports"],
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "no-underscore-dangle": "off",
    "no-nested-ternary": "off",
    "no-shadow": "off",
    "no-unused-expressions": "off",

    "import/prefer-default-export": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "import/extensions": "off",
    "unused-imports/no-unused-imports": "error",
  },
};
