import User from "../models/user.model.js";
import jwt from "jsonwebtoken";  // Importing jsonwebtoken for token generation

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;  // Get the JWT from cookies
        if (!token) {
            return res.status(401).send("Unauthorized: No token provided");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verify the token
        if (!decoded || !decoded.userId) {   // Check if the token is valid
            return res.status(401).send("Unauthorized: Invalid token");
        }
        const user = await User.findById(decoded.userId).select("-password");  // Find the user by ID and exclude the password field 
        if (!user) {
            return res.status(404).send("User not found");
        }
        req.user = user;  // Attach the user to the request object
        next();  // Call the next middleware or route handler
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(500).send("Internal server error");
    }
}