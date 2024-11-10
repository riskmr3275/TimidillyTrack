const { connect } = require('../config/database');



exports.getPendingStatus = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user
        console.log("User ID:", userId);
        const supabase = await connect();
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Fetch all pending orders for the user using Supabase query
        const { data: pendingOrders, error } = await supabase
            .from('orders')  // Query the orders table
            .select('order_id, user_id, title, order_number, created_at, order_status(status)')
            .eq('user_id', userId)  // Filter by user_id
            .eq('order_status.status', 'pending');  // Filter by pending status

        // Handle query errors     
        if (error) {
            console.error("Error fetching pending orders:", error.message);
            return res.status(500).json({
                success: false,
                message: "An error occurred while fetching pending orders",
                error: error.message
            });
        }

        // Check if there are pending orders
        if (!pendingOrders || pendingOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No pending orders found for the user"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pending orders fetched successfully",
            data: pendingOrders
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching pending orders",
            error: error.message
        });
    }
};

// startOrder function
exports.startOrder = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user
        console.log("User ID:", req.body);
  
        if (!userId) {     
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Step 1: Connect to Supabase
        const supabase = await connect();

        // Step 2: Fetch all orders for the user
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId);

        if (orderError) {
            console.error("Error fetching orders:", orderError);
            return res.status(500).json({
                success: false,
                message: "An error occurred while fetching orders",
                error: orderError.message
            });
        }

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No orders found for the user"
            });
        }

        // Step 3: Fetch order statuses for each order
        const orderIds = orders.map(order => order.order_id);
        const { data: orderStatuses, error: statusError } = await supabase
            .from('order_status')
            .select('*')
            .in('order_id', orderIds);

        if (statusError) {
            console.error("Error fetching order statuses:", statusError);
            return res.status(500).json({
                success: false,
                message: "An error occurred while fetching order statuses",
                error: statusError.message
            });
        }

        // Step 4: Merge orders with their statuses
        const ordersWithStatus = orders.map(order => {
            const status = orderStatuses.find(status => status.order_id === order.order_id);
            return {
                ...order,
                status: status ? status.status : null // Add status if found, otherwise null
            };
        });

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: ordersWithStatus
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching orders",
            error: error.message
        });
    }
};
   

// completedOrder function
exports.completedOrder = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user
        console.log("User ID:", userId);
        const supabase = await connect();
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Fetch all pending orders for the user using Supabase query
        const { data: pendingOrders, error } = await supabase
            .from('orders')  // Query the orders table
            .select('order_id, user_id, title, order_number, created_at, order_status(status)')
            .eq('user_id', userId)  // Filter by user_id
            .eq('order_status.status', 'completed');  // Filter by pending status

        // Handle query errors     
        if (error) {
            console.error("Error fetching completed orders:", error.message);
            return res.status(500).json({
                success: false,
                message: "An error occurred while fetching completed orders",
                error: error.message
            });
        }

        // Check if there are pending orders
        if (!pendingOrders || pendingOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No completed orders found for the user"
            });
        }

        return res.status(200).json({
            success: true,
            message: "completed orders fetched successfully",
            data: pendingOrders
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching completed orders",
            error: error.message
        });
    }
};



// inProgressOrder function
exports.progressOrder = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user
        console.log("User ID:", userId);
        const supabase = await connect();
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Fetch all pending orders for the user using Supabase query
        const { data: pendingOrders, error } = await supabase
            .from('orders')  // Query the orders table
            .select('order_id, user_id, title, order_number, created_at, order_status(status)')
            .eq('user_id', userId)  // Filter by user_id
            .eq('order_status.status', 'in progress');  // Filter by pending status

        // Handle query errors     
        if (error) {
            console.error("Error fetching pending orders:", error.message);
            return res.status(500).json({
                success: false,
                message: "An error occurred while fetching progress orders",
                error: error.message
            });
        }

        // Check if there are pending orders
        if (!pendingOrders || pendingOrders.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No progress orders found for the user"
            });
        }

        return res.status(200).json({
            success: true,
            message: "progress orders fetched successfully",
            data: pendingOrders
        });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching progress orders",
            error: error.message
        });
    }
};



exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.body.orderId; // Assuming orderId is passed in the URL
        console.log("Order ID:", orderId);

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Use the connect function to initialize the Supabase client
        const supabase = await connect();

        // Fetch the order details along with status by order_id
        const { data: orderDetails, error: orderError } = await supabase
            .from('orders')
            .select('*, order_status(status, updated_at)')
            .eq('order_id', orderId)
            .single(); // Assuming order_id is unique, so we use .single()

        if (orderError || !orderDetails) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the provided order ID"
            });
        }

        // Fetch the user details associated with the order
        const { data: userDetails, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', orderDetails.user_id)
            .single(); // Assuming user_id is unique

        if (userError || !userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found for the order"
            });
        }

        // Combine the results into a single response object
        const orderData = {
            order: orderDetails,
            user: userDetails
        };

        return res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            data: orderData
        });

    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching the order",
            error: error.message
        });
    }
};
// deleteOrder function
exports.deleteOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId; // Assuming orderId is passed in the URL
        console.log("Order ID:", orderId);

        if (!orderId) {  
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // Use the connect function to initialize the Supabase client
        const supabase = await connect();

        // Check if the order exists in the database
        const { data: orderDetails, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .single(); // Fetch the single order by order_id

        if (orderError || !orderDetails) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Delete the order from the orders table
        const { error: deleteOrderError } = await supabase
            .from('orders')
            .delete()
            .eq('order_id', orderId);

        if (deleteOrderError) {
            return res.status(500).json({
                success: false,
                message: "An error occurred while deleting the order",
                error: deleteOrderError.message
            });
        }

        // Optionally, delete related data (like order_status) if needed
        const { error: deleteStatusError } = await supabase
            .from('order_status')
            .delete()
            .eq('order_id', orderId);

        if (deleteStatusError) {
            return res.status(500).json({
                success: false,
                message: "An error occurred while deleting the order status",
                error: deleteStatusError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting order:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the order",
            error: error.message
        });
    }
};