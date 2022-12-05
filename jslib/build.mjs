import { build } from "esbuild";
async function buildA() {
  await build({
    entryPoints: ["jslib/app.jsx"],
    outfile: "dist/app.js",
    bundle: true,
    format: "esm",
    treeShaking: false,
    jsxFactory:'h'
  });
}

buildA();
