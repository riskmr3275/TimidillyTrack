
const express = require("express");
const router = express.Router();
const {auth,verifyOtp}=require("../middlewares/auth");    
// Import controllers
const { login,deleteAccount,updateProfile,sendOtp,signup,checkEmail } = require("../controllers/Auth");
const { changePassword,resetPasswordToken,resetPassword } = require("../controllers/Password");

// Routes
router.post("/login", login);//done
router.post("/signup",signup);//done
  
 

router.post('/check-email', checkEmail);
   
 
router.post("/sendotp", sendOtp);                                    // User login
router.post("/deleteAccount", auth, deleteAccount);             // Delete user profile
router.post("/updateProfile", auth, updateProfile);             // Update user profile
  

router.post("/changepassword", auth, changePassword);           // Change password with current password
router.post("/reset-password-token", resetPasswordToken);       // Generate a reset password token
 router.post("/reset-password", resetPassword);

// Export the router instance
module.exports = router;  // This line ensures that the router object is exported correctly
