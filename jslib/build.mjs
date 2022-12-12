import { build } from "esbuild";
async function buildA() {
  await build({
    entryPoints: ["demo/app.jsx"],
    outfile: "dist/app.js",
    bundle: true,
    format: "esm",
    treeShaking: false,
    jsxFactory:'h',
    inject: ['jslib/polyfill.mjs'],
  });
}

buildA();
