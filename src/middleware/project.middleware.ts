import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";
import { JwtPayload } from "jsonwebtoken";

export const projectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded === "string") {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Now TS knows decoded is JwtPayload, you can safely extract your custom fields
  const { userId, email } = decoded as { userId: string; email: string };
  req.user = { userId, email };

  next();
};
