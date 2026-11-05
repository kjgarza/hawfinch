import { isAuthenticated } from "@/src/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json({ authenticated: isAuthenticated(request) });
}
