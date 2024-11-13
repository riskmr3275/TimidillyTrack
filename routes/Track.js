 
const express = require("express");
const router = express.Router();

// Import authentication middleware
const { auth } = require("../middlewares/auth");

// Import controllers
const { getPendingStatus, startOrder, completedOrder, progressOrder,getOrderById,deleteOrder } = require("../controllers/Track");

 

   
// Order Routes
router.post("/pending", auth, getPendingStatus);                
router.post("/start", auth, startOrder);       
router.post("/completed", auth, completedOrder);  
router.post("/getOrder", auth, getOrderById);                  
router.post("/deleteOrder", auth, deleteOrder); 
router.post("/progressOrder", auth, progressOrder); 


// Export the router instance
module.exports = router;  // This line ensures that the router object is exported correctly
