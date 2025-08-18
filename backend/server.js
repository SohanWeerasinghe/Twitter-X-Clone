import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";  // Import dotenv to manage environment variables
import { v2 as cloudinary } from "cloudinary";  // Import cloudinary for image uploads

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"; // Import user routes

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();  // Load environment variables from .env file
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});  // Configure cloudinary with environment variables

const app = express(); 
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use("/api/auth",authRoutes);   // Mounting the auth routes
app.use("/api/user",userRoutes);   // Mounting the auth routes


app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
  connectMongoDB();
});