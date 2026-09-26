// Dev-only helper (temporary): lists local IPv4 addresses. Delete after use.
import os from "node:os";
export async function GET() {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });
  const out: string[] = [];
  for (const list of Object.values(os.networkInterfaces())) for (const a of list || []) if (a.family === "IPv4") out.push(a.address);
  return Response.json(out);
}
