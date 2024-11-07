const jwt = require("jsonwebtoken")
require("dotenv").config();
 

// auth middleware
exports.auth = async(req, res, next) => {
    try {
        // Extract Token
        const token = req.cookies.token || req.body.token || req.header("authorization")?.replace("Bearer ", "");
        console.log("Token in auth::", token);

        // If token is missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing"
            });
        }
        // Verify the token
        console.log("Going to decode the token");
        try {
            console.log("Before Decoding Token:");
            console.log(process.env.JWT_SECRET);
            
            const decode = jwt.verify(token, process.env.JWT_SECRET,{ algorithms: ['HS256'] }); // Decode contains payload
            console.log("Decoded Value:", decode);
            req.user = decode; // Attach decoded user to request
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: "Token is invalid",
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
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token",
            error: error.message
        });
    }
}

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

 