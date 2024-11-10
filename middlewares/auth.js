const jwt = require("jsonwebtoken")
require("dotenv").config();
const { connect } = require('../config/database'); // Adjust path as needed


// auth middleware
exports.auth = async (req, res, next) => {
    try {   

     
         
        // Extract Token from Cookies, Body, or Headers
        const token = req.cookies.token || req.body.token || req.header("authorization")?.replace("Bearer ", "");
        console.log("Token received in auth:", token);

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            });
        }

        // Verify JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined");
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        // Attempt to verify the token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
            req.user = decoded; // Attach decoded payload to request
            next();
        } catch (error) {
            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token",
                    error: error.message
                });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token has expired",
                    error: error.message
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Token verification failed",
                    error: error.message
                });
            }
        }
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while validating the token",
            error: error.message
        });
    }
};


// ++++++++++++++++++++++++++++isStudent+++++++++++++++++++++++++++++++++++++++++++


exports.isClient = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Client") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Client only"
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "User role cannot verified please try again"
        });
    }
}





exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        // Step 1: Connect to Supabase
        console.log("data",req.body);
        
        const supabase = await connect(); // Using the existing connect function to get the Supabase client

        // Step 2: Fetch the most recent OTP details for the email
        const { data: otpRecords, error } = await supabase
            .from('otp') // Replace with your OTP table name
            .select('otp, expires_at, created_at')
            .eq('email', email) // Filter by email
            .order('created_at', { ascending: false }) // Order by created_at to get the most recent record
            .limit(1); // Get only the most recent OTP record

        // Debugging: Log the response from Supabase
        console.log("OTP Records: ", otpRecords);

        if (error || !otpRecords || otpRecords.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No OTP found for this email. Please request a new OTP.",
                error: error ? error.message : "No data found"
            });
        }

        const otpRecord = otpRecords[0]; // Get the most recent OTP record

        // Step 4: Check if the OTP matches
        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // Step 5: Check if the OTP has expired
        if (otpRecord.expires_at && Date.now() > new Date(otpRecord.expires_at).getTime()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Step 6: If OTP is valid and not expired, proceed to next middleware
        next();

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while verifying the OTP.",
            error: error.message
        });
    }
};
