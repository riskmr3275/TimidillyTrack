const { connect } = require('../config/database');

// getPendingStatus function
exports.getPendingStatus = async (req, res) => {
    try {
        const { credential } = req.body; // This will be phone or email
        console.log("Received credential:", credential);

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Credential is required"
            });
        }

        const connection = await connect();

        // Check if the credential is an email or phone
        let query = 'SELECT * FROM users WHERE ';
        let queryParams = [];

        if (/\S+@\S+\.\S+/.test(credential)) {
            query += 'email = ?';
            queryParams = [credential];
        } else {
            query += 'phone = ?';
            queryParams = [credential];
        }

        const [pendingStatusRows] = await connection.execute(query, queryParams);

        if (pendingStatusRows.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "No pending orders found for the provided credential"
            });
        }

        let query1 = 'SELECT o.*, os.status FROM orders o JOIN order_status os ON o.order_id = os.order_id WHERE o.user_id = ?';
        let queryParams1 = [pendingStatusRows[0].user_id];

        const [pendingStatusRows1] = await connection.execute(query1, queryParams1);
        if (pendingStatusRows1.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "No pending orders found for the provided credential"
            });
        }

        const pendingStatus = pendingStatusRows1[0]; // Assuming first order status
        console.log("Pending Status:", pendingStatus);

        await connection.end();

        return res.status(200).json({
            success: true,
            message: "Pending status fetched successfully",
            data: pendingStatus
        });

    } catch (error) {
        console.error("Error fetching pending status:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// startOrder function
exports.startOrder = async (req, res) => {
    try {
        const { credential } = req.body; // This will be phone or email
        console.log("Received credential:", credential);

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Credential is required"
            });
        }

        const connection = await connect();

        // Check if the credential is an email or phone
        let query = 'SELECT us.*, or1.* FROM users AS us JOIN orders AS or1 ON us.user_id = or1.user_id WHERE';
        let queryParams = [];

        if (/\S+@\S+\.\S+/.test(credential)) {
            query += ' us.email = ?';
            queryParams = [credential];
        } else {
            query += ' us.phone = ?';
            queryParams = [credential];
        }
        console.log("Query:", query);
        
        const [orderRows] = await connection.execute(query, queryParams);

        if (orderRows.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "Order not found for the provided credential"
            });
        }

        // Assuming we're updating the order status to "In Progress"
        const order = orderRows[0];

        

        // Get updated order data
        const updatedOrderQuery = 'SELECT * FROM orders WHERE user_id = ?';
        const [updatedOrderRows] = await connection.execute(updatedOrderQuery, [order.user_id]);

        await connection.end();

        return res.status(200).json({
            success: true,
            message: "Order has been started and is now in progress",
            order: updatedOrderRows[0]
        });

    } catch (error) {
        console.error("Error starting order:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// completedOrder function
exports.completedOrder = async (req, res) => {
    try {
        const { credential } = req.body; // This will be phone or email
        console.log("Received credential:", credential);

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Credential is required"
            });
        }

        const connection = await connect();

        let query = 'SELECT us.*, or1.* FROM users as us JOIN orders as or1 ON us.user_id = or1.user_id WHERE';
        let queryParams = [];


        if (/\S+@\S+\.\S+/.test(credential)) {
            query += ' us.email = ?';
            queryParams = [credential];
        } else {
            query += ' us.phone = ?';
            queryParams = [credential];
        }
        console.log("Query:", query);
        const [orderRows] = await connection.execute(query, queryParams);

        if (orderRows.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "Order not found for the provided credential",
            });
        }

        const order = orderRows[0];

       

        // Get updated order data
        const updatedOrderQuery = 'SELECT * FROM orders WHERE order_id = ?';
        const [updatedOrderRows] = await connection.execute(updatedOrderQuery, [order.order_id]);

        await connection.end();

        return res.status(200).json({
            success: true,
            message: "Order has been completed",
            order: updatedOrderRows[0]
        });

    } catch (error) {
        console.error("Error completing order:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// progressOrder function
exports.progressOrder = async (req, res) => {
    try {
        const { credential } = req.body; // This will be phone or email
        console.log("Received credential:", credential);

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Credential is required"
            });
        }

        const connection = await connect();

        let query = 'SELECT us.*,or1.* FROM users as us JOIN orders as or1 ON us.user_id=or1.user_id WHERE ';
        let queryParams = [];

        if (/\S+@\S+\.\S+/.test(credential)) 
        {
            query += 'email = ?';
            queryParams = [credential];
        } else 
        {
            query += 'phone = ?';
            queryParams = [credential];
        }
        const [orderRows] = await connection.execute(query, queryParams);

        if (orderRows.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "Order not found for the provided credential"
            });
        }
        const order = orderRows[0];
        console.log("Order found:", order);
        if (!order.order_id) {
            // If no order_id found, return an error
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "Order ID is missing or invalid"
            });
        }
       

 
        // Get updated order data
        const updatedOrderQuery = 'SELECT * FROM orders WHERE order_id = ?';
        const [updatedOrderRows] = await connection.execute(updatedOrderQuery, [order.order_id]);

        if (updatedOrderRows.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                message: "Updated order not found"
            });
        }
        await connection.end();
        return res.status(200).json({
            success: true,
            order: updatedOrderRows[0],
            message: "Order status has been updated to In Progress"
        });

    } catch (error) {
        console.error("Error updating order status to In Progress:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
