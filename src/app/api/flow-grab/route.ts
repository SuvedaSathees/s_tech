// Dev-only helper: copies a Google Flow render into public/flow-out/. Delete after use.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const { url, name } = (await req.json()) as { url: string; name: string };
  const u = new URL(url);
  if (!u.hostname.endsWith("flow-content.google") && !u.hostname.endsWith("googleusercontent.com"))
    return new Response("bad host", { status: 400 });
  if (!/^[\w.-]+$/.test(name)) return new Response("bad name", { status: 400 });
  const r = await fetch(url);
  if (!r.ok) return new Response("fetch " + r.status, { status: 502 });
  const buf = Buffer.from(await r.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "flow-out");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return Response.json({ ok: true, bytes: buf.length, type: r.headers.get("content-type") });
}
