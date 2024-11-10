// Import authentication middleware
const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");

// Import controllers
const { createOrder } = require("../controllers/Order");

 

   
// Order Routes
router.post("/createOrder", auth, createOrder);                
// router.post("/updateOrder", auth, updateOrder);       
// Export the router instance

module.exports = router;  // This line ensures that the router object is exported correctly
