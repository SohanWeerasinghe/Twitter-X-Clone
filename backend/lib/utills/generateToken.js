import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId,res) => {  // Function to generate JWT token and set it as a cookie
  const token = jwt.sign({userId},process.env.JWT_SECRET, {  // Sign the token with the user ID and secret key
     expiresIn: "15d"  // Token expiration time
});
  res.cookie("jwt", token, {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",  // ✅ only secure in production
  maxAge: 15 * 24 * 60 * 60 * 1000,
});

};