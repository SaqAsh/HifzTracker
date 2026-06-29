/**
 * Standalone Prettier config, replacing `@vercel/style-guide/prettier`.
 *
 * `endOfLine`, `tabWidth`, `printWidth`, and `useTabs` are Prettier defaults
 * that an EditorConfig file could otherwise override, so we set them explicitly.
 */
const config = {
  endOfLine: 'lf',
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,
  singleQuote: true,
  plugins: ['prettier-plugin-packagejson'],
};

export default config;
