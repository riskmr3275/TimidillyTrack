// const express = require("express");
// const router = express.Router();

 

// // Import controllers
// const {
//   login,
// } = require("../controllers/Auth");

// // Routes
// router.post("/login", login); // Login route (auth can be added if required)

 
   
// module.exports = router;

const express = require("express");
const router = express.Router();

// Import controllers
const { login } = require("../controllers/Auth");

// Routes
router.post("/login", login);

// Export the router instance
module.exports = router;  // This line ensures that the router object is exported correctly
