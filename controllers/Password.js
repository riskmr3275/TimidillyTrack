const { connect } = require('../config/database');
const bcrypt = require('bcryptjs'); // Make sure bcrypt is imported
const mailSender = require('../utils/mailSender');

exports.changePassword = async (req, res) => {
    try {
        console.log("Request body received:", req.body);

        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id; // Assuming user ID is available in req.user
        const supabase=await connect();
        // Get user detail for verification from Supabase
        const { data: user, error } = await supabase
            .from('users')  // Replace with your table name
            .select('user_id, password')
            .eq('user_id', userId)
            .single();  // Get a single user

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if the old password matches
        const checkPassword = await bcrypt.compare(oldPassword, user.password);
        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password does not match"
            });
        }

        // Hash the new password
        const finalPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in Supabase
        const { error: updateError } = await supabase
            .from('users')  // Replace with your table name
            .update({ password: finalPassword })
            .eq('user_id', userId);

        if (updateError) {
            return res.status(500).json({
                success: false,
                message: "Error updating password",
                error: updateError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Error in changePassword:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while changing the password",
            error: error.message
        });
    }
};
  
   

exports.resetPasswordToken = async (req, res) => {
    try {
        const email = req.body.email;  
        const supabase=await connect();
        // Check if the user exists in the 'student_details' table (supabase)
        const { data: user, error } = await supabase
            .from('users')  // Replace with your table name
            .select('*')
            .eq('email', email)
            .single();  // Get a single user by email

        if (error || !user) {
            return res.status(400).json({
                success: false,
                message: "Your account is not registered"
            });
        }

        // Generate a unique token and set an expiration time (5 minutes)
        const token = crypto.randomUUID();
        const expirationTime = Date.now() + 5 * 60 * 1000; // Token valid for 5 minutes

        // Update the user record with the reset token and expiration time
        const { error: updateError } = await supabase
            .from('users')  // Replace with your table name
            .update({ token: token, reset_pass_expires: expirationTime })
            .eq('email', email);

        if (updateError) {
            return res.status(500).json({
                success: false,
                message: "Error updating reset token",
                error: updateError.message
            });
        }

        // Generate the frontend URL with the reset token
        const url = `http://localhost:4000/update-password/${token}`;

        // Send the reset password email to the user with the URL
        await mailSender(email, "Reset Password Link", `Click on the link to reset your password: ${url}`);

        // Send success response
        return res.status(200).json({
            success: true,
            message: "Email sent successfully. Please check your email.",
            token: token,
            url: url
        });

    } catch (error) {
        console.error("Error in resetPasswordToken:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting the password.",
            error: error.message
        });
    }
};


exports.resetPassword = async (req, res) => {
    let connection;
    try {
        // Fetch data
        const { password, confirmPassword, token } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Both passwords must be the same"
            });
        }

        // Connect to the database
        connection = await connect();

        // Get user details by token
        const [userDetails] = await connection.query("SELECT * FROM users WHERE token = ?", [token]);

        // Check if user exists and token is valid
        if (userDetails.length === 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: "Token is invalid"
            });
        }

        const user = userDetails[0];

        // Check if the token has expired
        if (user.resetPasswordExpires < Date.now()) {
            await connection.end();
            return res.status(400).json({
                success: false,
                message: "Token has expired, please request a new one"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear the token
        await connection.query("UPDATE users SET password = ?, token = NULL, resetPasswordExpires = NULL WHERE token = ?", [hashedPassword, token]);

        // Send confirmation email
        await mailSender(user.email, "Your Password Has Been Reset", "Your password has been successfully reset");

        // Close the connection
        await connection.end();

        // Return success response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Error occurred during password reset:", error);
        if (connection) await connection.end(); // Ensure connection closure
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting the password",
            error: error.message
        });
    }
};