const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { connect } = require('../config/database');
const mailSender = require("../utils/mailSender");
const otpGenerate = require("otp-generator");

exports.login = async (req, res) => {
    try {
        const { credential, password } = req.body;
        console.log("Received credential:", credential, "Password:", password);

        // Validate input
        if (!credential || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Step 1: Connect to Supabase
        const supabase = await connect(); // Using the existing connect function to get the Supabase client

        // Step 2: Check if the credential is an email, phone, or order_id
        let query;
        let queryParams = [];

        if (/\S+@\S+\.\S+/.test(credential)) {
            // The credential is an email
            query = supabase.from('users').select('*').eq('email', credential);
        } else if (/^\d{10}$/.test(credential)) {
            // The credential is a phone number (assuming 10-digit format)
            query = supabase.from('users').select('*').eq('phone', credential);
        } else {
            // The credential is an order_id, so we need to check the order and user
            query = supabase.from('orders').select('*').eq('order_id', credential);
        }

        // Step 3: Execute the query and handle results
        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            return res.status(401).json({
                success: false,
                message: "No matching record found. Please check your credentials."
            });
        }

        // Step 4: Handle login logic for order_id (if applicable)
        if (query.table === 'orders') {
            const order = data[0]; // The found order

            // Get the user associated with this order
            const { data: userRows, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', order.user_id);

            if (userError || !userRows || userRows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found for the given order."
                });
            }

            const user = userRows[0];

            // Step 5: Check if the password matches
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
        }

        // Step 6: If it's a user login (either by email or phone), we check the password
        const user = data[0];
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
    }
};


exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Step 1: Validate input
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Step 2: Check if email is valid
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address"
        });
    }

    try {
        // Step 3: Connect to Supabase
        const supabase = await connect(); // Use the existing connect function to get the Supabase client

        // Step 4: Check if the email already exists in the database
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single(); // Get a single result

        if (userError && userError.code !== 'PGRST116') { // Check if there's an error other than 'no rows found'
            throw new Error(userError.message);
        }

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Step 5: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 6: Store the new user data in the database
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                first_name: firstName,
                last_name: lastName,
                email,
                password: hashedPassword
            }])
            .single(); // Ensure only one user is returned

        if (insertError) {
            throw new Error(insertError.message);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
             // Assuming 'id' is the column for user ID
        });

    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong during registration",
            error: error.message
        });
    }
};
// Send OTP function
exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    console.log("Received email:", email);

    let supabase;

    try {
        // Connect to Supabase
        supabase = await connect();  // Get the supabase client instance

        // Check if the email is already registered
        const { data: userRows, error: userError } = await supabase
            .from('users')  // Your 'users' table
            .select('email')
            .eq('email', email);

        if (userError) {
            throw new Error(userError.message);
        }

        if (userRows.length > 0) {
            return res.status(200).json({
                success: false,
                message: "User Already Exists"
            });
        }

        // Generate OTP and ensure uniqueness
        let otp;
        let otpRows;
        do {
            otp = otpGenerate.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });

            // Check if OTP is unique
            const { data: otpData, error: otpError } = await supabase
                .from('otp')  // Your 'otp' table
                .select('otp')
                .eq('otp', otp);

            if (otpError) {
                throw new Error(otpError.message);
            }

            otpRows = otpData.length;
        } while (otpRows > 0);
        console.log("Generated OTP:", otp);

        // Store OTP in the database
        const { error: otpInsertError } = await supabase
            .from('otp')  // Your 'otp' table
            .insert([{ email, otp }]);

        if (otpInsertError) {
            throw new Error(otpInsertError.message);
        }

        // Send OTP to the user email
        const mailResult = await mailSender(email, "Verification from Timidlly",otp);
        console.log("Email sent:", mailResult);

        // Return OTP response
        return res.status(200).json({
            otp:otp,
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        console.error("Error during OTP generation:", error);
        return res.status(500).json({
            success: false,
            message: "Error during OTP generation",
            error: error.message
        });
    } finally {
        if (supabase) {
            // No explicit close method for Supabase as it uses a connection pool.
        }
    }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
    let connection;
    try {
        const userId = req.user.id;
        connection = await connect();
        await connection.query('DELETE FROM users WHERE user_id = $1', [userId]);

        return res.status(200).json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) await connection.end();
    }
};




// Update Profile
exports.updateProfile = async (req, res) => {
    let connection;
    try {
        const { email, phone } = req.body;
        const userId = req.user.id;
        connection = await connect();
        const query = 'UPDATE users SET email = $1, phone = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 RETURNING *';
        const result = await connection.query(query, [email, phone, userId]);

        return res.status(200).json({ success: true, user: result.rows[0], message: "Profile updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) await connection.end();
    }
};
