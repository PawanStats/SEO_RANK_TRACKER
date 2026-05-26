import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("🔐 Auth check - Header:", authHeader ? "Present" : "Missing");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ No token or invalid format");
            return res.status(401).json({success: false, message: "No token provided"});
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.id };
        console.log("✅ Auth passed - User ID:", decoded.id);
        next();
    } catch (error) {
        console.error("❌ Auth middleware error:", error.message);
        res.status(401).json({success: false, message: "Invalid token"});
    } 
}

export default auth;