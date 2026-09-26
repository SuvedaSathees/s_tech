// Dev-only helper (temporary): saves an uploaded body into public/flow-out/. Delete after use.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const name = new URL(req.url).searchParams.get("name") || "";
  if (!/^[\w.-]+$/.test(name)) return new Response("bad name", { status: 400 });
  const buf = Buffer.from(await req.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "flow-out");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return Response.json({ ok: true, bytes: buf.length });
}
