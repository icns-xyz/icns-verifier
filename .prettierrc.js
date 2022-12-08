module.exports = {
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
  importOrder: ["<THIRD_PARTY_MODULES>", "^../(.*)$", "^./(.*)$"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  bracketSpacing: true,
  singleQuote: false,
  trailingComma: "all",
  semi: true,
};
