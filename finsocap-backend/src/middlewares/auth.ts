import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string | number;
    email?: string;
    phone?: string;
    role: string;
    type: "admin" | "partner";
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication token required." });
    return;
  }

  const secret = process.env.JWT_SECRET || "finsocap_super_secret_jwt_key_2026";

  jwt.verify(token, secret, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ success: false, message: "Invalid or expired session token." });
      return;
    }
    req.user = decoded;
    next();
  });
};

// Optional check for Admin only routes
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.type !== "admin" && req.user?.role !== "Admin") {
    res.status(403).json({ success: false, message: "Admin access required." });
    return;
  }
  next();
};
