// const bcrypt = require('bcryptjs');
// const jwt = require("jsonwebtoken")
// const { connect } = require('../config/database');
// const { log } = require('node:console');

// // Login function
// exports.login = async (req, res) => {
//     try {
//         const { credential, password } = req.body;
//         console.log(req.body);
        
//         console.log("Received credential:", credential, "Password:", password);
//         console.log("My anme is Risuy");
        
//         if (!credential || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         const connection = await connect();

//         // Check if the credential is an email or an order ID
//         let query = 'SELECT * FROM users WHERE ';
//         let queryParams = [];

//         // Check if the credential is an email or an order ID
//         if (/\S+@\S+\.\S+/.test(credential)) {
//             // The credential is an email
//             query += 'email = ?';
//             queryParams = [credential];
//         } else {
//             // The credential is an order ID
//             query += 'order_id = ?';
//             queryParams = [credential];
//         }

//         // Execute the query to find the user by email or order ID
//         const [userRows] = await connection.execute(query, queryParams);
        
//         if (userRows.length === 0) {
//             await connection.end();
//             return res.status(401).json({
//                 success: false,
//                 message: "User not registered. Please sign up first."
//             });
//         }

//         const user = userRows[0];
//         console.log("User:", user);
        
//         // Check if the password matches
//         if (await bcrypt.compare(password, user.password)) {
//             const payload = {
//                 email: user.email,
//                 id: user.user_id,
//                 accountType: user.accountType
//             };
//             const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

//             // Create cookie options
//             const options = {
//                 expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//                 httpOnly: true
//             };

            
 
//             await connection.end();

//             return res.cookie("token", token, options).status(200).json({
//                 success: true,
//                 token,
//                 user,
//                 message: "Logged in successfully"
//             });
//         } else {
//             await connection.end();
//             return res.status(401).json({
//                 success: false,
//                 message: "Incorrect password"
//             });
//         }
//     } catch (error) {
//         console.error("Error logging in:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { connect } = require('../config/database');
const { log } = require('node:console');

// Login function
exports.login = async (req, res) => {
    let connection;
    try {
        const { credential, password } = req.body;
        console.log("Received credential:", credential, "Password:", password);

        if (!credential || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        connection = await connect();

        // Check if the credential is an email or an order ID
        let query = 'SELECT * FROM users WHERE ';
        let queryParams = [];

        if (/\S+@\S+\.\S+/.test(credential)) {
            // The credential is an email
            query += 'email = ?';
            queryParams = [credential];
        } else {
            // The credential is an order ID
            query += 'order_id = ?';
            queryParams = [credential];
        }

        // Execute the query to find the user by email or order ID
        const [userRows] = await connection.execute(query, queryParams);
        
        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "User not registered. Please sign up first."
            });
        }

        const user = userRows[0];
        console.log("User found:", user);
        
        // Check if the password matches
        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const payload = {
                    email: user.email,
                    id: user.user_id,
                    accountType: user.accountType
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

                // Set cookie options
                const options = {
                    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days expiry for the cookie
                    httpOnly: true,
                };

                // Send the response with the token and user info
                return res.cookie("token", token, options).status(200).json({
                    success: true,
                    token,
                    user,
                    message: "Logged in successfully"
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect password"
                });
            }
        } catch (err) {
            console.error("Error comparing password:", err);
            return res.status(500).json({
                success: false,
                message: "Error during password verification."
            });
        }

    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
