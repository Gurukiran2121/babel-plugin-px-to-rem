import babel from "@rollup/plugin-babel";

export default {
  input: "plugin/babel-plugin-px-to-rem.js",
  output: [
    {
      file: "dist/babel-plugin-px-to-rem.cjs.js",
      format: "cjs",
    },
    {
      file: "dist/babel-plugin-px-to-rem.esm.js",
      format: "esm",
    }
  ],
  plugins: [babel({ babelHelpers: "bundled" })],
};
