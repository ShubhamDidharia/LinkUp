import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protectedRoute = async(req, res, next) => {
    try{
        const token  = req.cookies.jwt; // "cookies.jwt" is the name of the cookie where the JWT token is stored
        if(!token){
            return res.status(401).json({ error: "Unauthorized access, please login" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ error: "Unauthorized access, invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password"); // Exclude password and version field from the user object
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user; // Attach the user object to the request for further use in the route
        next(); // Call the next middleware or route handler


    }
    catch(err){
        console.error("Error in protected route middleware:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}