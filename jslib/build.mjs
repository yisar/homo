import { build } from "esbuild";
async function buildA() {
  await build({
    entryPoints: ["./js/app.jsx"],
    outfile: "dist/app.js",
    bundle: true,
    format: "esm",
    treeShaking: false,
    jsxFactory:'h'
  });
}

buildA();
