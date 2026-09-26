import { chromium } from "playwright";
const [,, ...points] = process.argv;
const W = Number(process.env.W || 1600), H = Number(process.env.H || 900);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("console", (m) => { if (m.type() === "error" || m.type()==="warning") console.log("console:", m.text().slice(0, 200)); });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.goto(process.env.URL || "http://localhost:3000/?debug", { waitUntil: "networkidle" });
await page.waitForTimeout(4000);
for (const pt of points) {
  // pt: "h0.35" → hero progress ; "#id" → section ; number → absolute y
  let y;
  if (pt.startsWith("h")) {
    const p = Number(pt.slice(1));
    y = await page.evaluate((p) => {
      const st = window.__ST?.getAll?.() || [];
      const vh = innerHeight; return p * (11 - 1) * vh;
    }, p);
  } else if (pt.startsWith("#")) {
    y = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, pt);
    if (process.env.OFF) y += Number(process.env.OFF);
  } else y = Number(pt);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(700);
  if (pt.startsWith("h")) await page.evaluate((p) => { if (window.__hero) { window.__hero.current = p; window.__hero.target = p; } }, Number(pt.slice(1)));
  await page.waitForTimeout(Number(process.env.WAIT || 2200));
  const name = `shots/${(process.env.PREFIX||"")}${pt.replace(/[#.]/g, "_")}.png`;
  await page.screenshot({ path: name });
  console.log("shot", name, "y=", Math.round(y));
}
await browser.close();
