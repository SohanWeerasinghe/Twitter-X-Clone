import User from "../models/user.model.js";      // Import User model
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import cloudinary from "cloudinary"; // Import cloudinary for image uploads
import Notification from "../models/notification.model.js"; // Import Notification model

export const getUserProfile = async (req, res) => {      // Function to get user profile by username
    const { username } = req.params;        // Extract username from request parameters
    try {
        const user = await User.findOne({ username }).select("-password");      // Exclude password from the response 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);     // Return user profile without password
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const followUnfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Cannot follow/unfollow yourself
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow/unfollow yourself" });
    }

    // Fetch both users
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
  // Unfollow
  currentUser.following.pull(targetUserId);
  targetUser.followers.pull(currentUserId);
  await currentUser.save();
  await targetUser.save();
  return res.status(200).json({ message: "Unfollowed successfully" });
} else {
  // Follow
  currentUser.following.push(targetUserId);
  targetUser.followers.push(currentUserId);
  await currentUser.save();
  await targetUser.save();

  // Create a notification for the followed user
  
  try {
  const newNotification = new Notification({
    type: "follow",
    from: req.user._id,
    to: targetUser._id,
  });
  await newNotification.save();
} catch (err) {
  console.error("Notification creation error:", err);
}

  return res.status(200).json({ message: "Followed successfully" });
}

  } catch (error) {
    console.error("Error following/unfollowing user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id; // Current user's ID
    const currentUser = await User.findById(userId).select("following");

    // Get 10 random users excluding the current user
    const users = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 10 } }
    ]);

    // Filter out users that the current user is already following
    const suggestedUsers = users
      .filter(user => !currentUser.following.includes(user._id))
      .map(user => {
        user.password = undefined; // Exclude password
        return user;
      })
      .slice(0, 4); // Limit to 4 users

    res.status(200).json(suggestedUsers); // ✅ Send response
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } = req.body;
  let { coverImage, profileImage } = req.files || {};

  const userId = req.user._id; // Get the current user's ID from the request
  
  try {
      let user = await User.findById(userId); // Find the user by ID
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      if ((newPassword && !currentPassword) || (!newPassword && currentPassword)) {
          return res.status(400).json({ message: "Both current and new passwords must be provided" });
      }
      if (currentPassword && newPassword) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt); // Hash the new password
      }
      // Update user profile fields
      if (profileImage) {
        if (user.profileImage) {
          await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]); // Delete old profile image from Cloudinary
        }
        const uploadedResponse = await cloudinary.uploader.upload(profileImage)
        profileImage = uploadedResponse.secure_url; // Get the secure URL from Cloudinary
        user.profileImage = profileImage; // Update profile image URL
      } 
      if (coverImage) {
        if (user.coverImg) {
          await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]); // Delete old profile image from Cloudinary
        }
        const uploadedResponse = await cloudinary.uploader.upload(coverImage)
        coverImage = uploadedResponse.secure_url; // Get the secure URL from Cloudinary
        user.coverImage = coverImage; // Update cover image URL
      }

      user.fullname = fullname || user.fullname; // Update fullname if provided
      user.email = email || user.email; // Update email if provided
      user.username = username || user.username; // Update username if provided
      user.bio = bio || user.bio; // Update bio if provided
      user.link = link || user.link; // Update link if provided 

      await user.save(); // Save the updated user profile

      user.password = null; // Exclude password from the response

      res.status(200).json({ message: "Profile updated successfully", user }); // Return success response with updated user

  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};