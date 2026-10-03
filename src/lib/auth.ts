import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local");
}

export function generateToken(user: { _id: string; role: string }) {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role 
    }, 
    JWT_SECRET!, 
    {
      expiresIn: "7d",
    }
  );
}