
const { connect } = require('../config/database');


exports.createOrder = async (req, res) => {
    try {
        const user_id = req.user.id; // Get the user ID from the authenticated user
        const { title } = req.body; // Assuming 'title' is required for the order
        const order_number = "ORD" + Math.floor(1000 + Math.random() * 9000); // Generate a random order number
        
        if (!user_id || !title) {
            return res.status(400).json({
                success: false,
                message: "user_id and title are required"
            });
        }

        // Connect to Supabase
        const supabase = await connect();

        // Insert the new order into the 'orders' table
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    user_id: user_id,
                    title: title,
                    order_number: order_number
                }
            ])
            .single();  // Ensure only a single record is returned
            
        if (orderError) {
            return res.status(500).json({
                success: false,
                message: "Error creating order",
                error: orderError.message
            });
        }
        
        console.log("Order created successfully:", orderData);

        // Insert the initial 'pending' status for the new order into the 'order_status' table
        const { data: statusData, error: statusError } = await supabase
            .from('order_status')
            .insert([
                {
                    order_id: orderData.order_id,  // Link status to the newly created order
                    status: 'pending',             // Default status is 'pending'
                    message: 'Order has been created and is pending.'
                }
            ])
            .single();

        if (statusError) {
            return res.status(500).json({
                success: false,
                message: "Error creating order status",
                error: statusError.message
            });
        }

        // Return the created order and its initial status
        return res.status(201).json({
            success: true,
            message: "Order created successfully with pending status",
            data: {
                order: orderData,
                status: statusData
            }
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating the order",
            error: error.message
        });
    }
};
