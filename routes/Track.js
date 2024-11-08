// const express = require("express");
// const router = express.Router();

// // Import authentication middleware (adjust as needed)
// const { auth } = require("../middlewares/auth");

// // Import controllers
// const {
//   getPendingStatus,
//   startOrder,
//   completedOrder,
//   progressOrder,
// } = require("../controllers/Track");

// // Routes
 
 

// router.post("/pending", auth, getPendingStatus); // Check pending status
// router.post("/start", auth, startOrder); // Start a new order
// router.post("/completed", auth, completedOrder); // Check if order is completed
// router.post("/progress", auth, progressOrder); // Check order progress

// module.exports = router;

const express = require("express");
const router = express.Router();

// Import authentication middleware
const { auth } = require("../middlewares/auth");

// Import controllers
const { getPendingStatus, startOrder, completedOrder, progressOrder } = require("../controllers/Track");

// Routes
router.post("/pending", auth, getPendingStatus); // Check pending status
router.post("/start", auth, startOrder); // Start a new order
router.post("/completed", auth, completedOrder); // Check if order is completed
router.post("/progress", auth, progressOrder); // Check order progress

// Export the router instance
module.exports = router;  // This line ensures that the router object is exported correctly
