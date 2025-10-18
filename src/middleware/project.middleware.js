import { verifyToken } from "../lib/jwt.js";


export const projectMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(403).json({ error: "Invalid token" });
    }

    req.user = decoded;
    next();
}