import { NextRequest } from "next/server";
import { JwtPayload, verifyAccessToken } from "./jwt";

type AuthedHandler = (
  request: NextRequest,
  user: JwtPayload,
) => Promise<Response>;

export function withAuth(handler: AuthedHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Access token is required" },
        { status: 401 },
      );
    }
    const token = authHeader.slice(7);
    let user: JwtPayload;
    try {
      user = verifyAccessToken(token);
    } catch {
      return Response.json(
        { error: "Invalid or expired access token" },
        { status: 401 },
      );
    }

    return handler(request, user);
  };
}
