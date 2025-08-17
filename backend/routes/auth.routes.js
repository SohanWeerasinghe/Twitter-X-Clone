import express from "express";
import { login, register, logout } from "../controllers/auth.controller.js";
import dotenv from "dotenv";  // Import dotenv to manage environment variables

dotenv.config();  // Load environment variables from .env file

const router = express.Router();
console.log(process.env.MONGO_URI);     // Log the MONGO_URI to verify it's loaded correctly

router.get("/login", login);

router.get("/register", register); 

router.get("/logout", logout); 

export default router;
