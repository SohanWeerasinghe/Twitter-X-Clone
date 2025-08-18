import express from "express";
import { protectRoute } from "../middleware/protectRoute.js"; // Import middleware to protect routes
import { getUserProfile, followUnfollowUser, getSuggestedUsers, updateUserProfile } from "../controllers/user.controller.js"; // Import user controller functions      

const router = express.Router();

router.get("/profile/:username",protectRoute,getUserProfile); // Route to get user profile by username
router.get("/suggested",protectRoute,getSuggestedUsers); // Route to update user profile by username
router.post("/follow/:id",protectRoute,followUnfollowUser); // Route to delete user profile by username
router.post("/update",protectRoute,updateUserProfile); // Route to follow/unfollow user by ID 


export default router;
