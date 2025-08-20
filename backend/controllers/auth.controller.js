import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utills/generateToken.js"; // Assuming you have a utility function to generate token and set cookie

export const signup = async (req, res) => {
  // Handle login logic here
  try 
  {
    // Example: Authenticate user with username and password
    const { fullname, email, username, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).send("Invalid email format");
    }
    const existingUser = await User.findOne({ username});
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).send("Email already exists");
    }
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }
    //hash the password here if needed
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
        username,
        fullname,
        email,
        password: hashedPassword,
    })
    if (newUser) {  // If user creation is successful
        generateTokenAndSetCookie(newUser._id, res);  // Generate token and set it as a cookie
        await newUser.save();  // Save the new user to the database

        res.status(201).json({   // Respond with the new user's data
            _id: newUser._id,
            username: newUser.username,
            fullname: newUser.fullname,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profilePicture: newUser.profilePicture,
            coverImg: newUser.coverImg,
        });
    } else {  // If user creation failed, send an error response
        res.status(400).send("User registration failed");
    }
  } catch (error) 
  {
    console.error("Signup error:", error);
    res.status(500).send("Internal server error");
  }
}

export const login = async (req, res) => {
  try {
    // Accept username/password from body, query params, or form-data
    const username = req.body.username || req.query.username;
    const password = req.body.password || req.query.password;

    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send("Invalid username or password");
    }

    // Compare password using bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send("Invalid username or password");
    }

    // Generate JWT cookie
    generateTokenAndSetCookie(user._id, res);

    // Return user info
    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profilePicture: user.profilePicture,
      coverImg: user.coverImg,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal server error");
  }
};


export const logout = (req, res) => {
  try{
    res.clearCookie("token");  // Clear the token cookie
  res.status(200).send("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send("Internal server error");
  }
}

export const getMe = async (req, res) => {
  try {
    // req.user is set in protectRoute middleware
    const user = await User.findById(req.user._id).select("-password");  

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);  
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).send("Internal server error");
  }
}