import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local");
}

export interface DecodedUser {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken(token: string): DecodedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as DecodedUser;
  } catch (error) {
    console.error("JWT Verification failed", error);
    return null;
  }
}

/**
 * Extract token from Authorization header and verify
 * Format: "Bearer <token>"
 */
export function getUserFromRequest(request: Request): DecodedUser | null {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return verifyToken(token);
}