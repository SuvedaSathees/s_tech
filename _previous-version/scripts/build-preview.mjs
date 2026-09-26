import { build } from "esbuild";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

mkdirSync("preview-dist", { recursive: true });
await build({
  entryPoints: ["scripts/preview-entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  outfile: "preview-dist/app.js",
  alias: { "next/dynamic": "./scripts/shims/next-dynamic.tsx" },
  tsconfig: "tsconfig.json",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  logLevel: "warning",
});
execSync("npx @tailwindcss/cli -i src/app/globals.css -o preview-dist/app.css --minify", { stdio: "inherit" });

const b64 = (p) => readFileSync(p).toString("base64");
const fonts = `@font-face{font-family:"Manrope";src:url(data:font/woff2;base64,${b64("src/app/fonts/Manrope-Variable.woff2")}) format("woff2");font-weight:200 800;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url(data:font/woff2;base64,${b64("src/app/fonts/JetBrainsMono-Regular.woff2")}) format("woff2");font-weight:400;font-display:swap}
:root{--font-manrope:"Manrope";--font-jetbrains:"JetBrains Mono";color-scheme:dark;background:#050505}
body{background:#050505;color:#e9ebee;margin:0}`;
const css = readFileSync("preview-dist/app.css", "utf8");
const js = readFileSync("preview-dist/app.js", "utf8").replace(/<\/script/gi, "<\\/script");
const html = `<title>S Tec Secure</title>
<meta name="description" content="Security that thinks. Intelligent security & automation for modern spaces.">
<style>${fonts}\n${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync("preview-dist/stec-secure.html", html);
console.log("html bytes", html.length);
