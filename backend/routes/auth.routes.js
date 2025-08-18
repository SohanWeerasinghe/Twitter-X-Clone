import express from "express";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";
import dotenv from "dotenv";  // Import dotenv to manage environment variables
import { protectRoute } from "../middleware/protectRoute.js";  // Import middleware to protect routes

dotenv.config();  // Load environment variables from .env file

const router = express.Router();
console.log(process.env.MONGO_URI);     // Log the MONGO_URI to verify it's loaded correctly

router.post("/signup", signup);

router.post("/login", login); 

router.post("/logout", logout); 

router.get("/getMe",protectRoute, getMe);  // Added GET route for logout

export default router;
