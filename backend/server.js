import express from "express";
import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

const app = express(); 
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use("/api/auth",authRoutes);   // Mounting the auth routes

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
  connectMongoDB();
});