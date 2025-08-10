import jwt from "jsonwebtoken";
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Access denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(403).json({ message: "Invalid token" });
    }
};
export const isAdmin = (req, res, next) => {
    const user = req.user;
    if (user?.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map