// Import the Supabase client library
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Function to configure and connect to Supabase
const connect = async () => {
    try {
        // Initialize the Supabase client with your environment variables
        const supabase = createClient(
            process.env.SUPERBASE_URL,       // Your Supabase URL
            process.env.SUPERBASE_KEY  // Your Supabase API Key
        );

        // Test the connection by fetching data from a table (e.g., 'users')
        const { data, error } = await supabase
            .from('users')  // Replace with the actual table you want to query
            .select('*')
            .limit(1);

        if (error) {
            console.error("Supabase connection failed:", error.message);
            process.exit(1);  // Exit the process with failure  
        }

        console.log("Supabase connected successfully:", data);
        return supabase; // Return the Supabase client
    } catch (error) {
        console.error("Supabase connection failure");
        console.error(error.message);
        process.exit(1);  // Exit the process with failure
    }
};

module.exports = { connect };


// const mysql = require('mysql2/promise'); // Use mysql2/promise for async/await support
// require('dotenv').config();

// const connect = async () => {
//     try {
//         const connection = await mysql.createConnection({
//             host: process.env.HOST,
//             user: process.env.USER,
//             password: process.env.PASSWORD,
//             database: process.env.DATABASE
//         });
//         console.log("SQL connected successfully");
//         return connection;  // Return the connection object
//     } catch (error) {
//         console.error("SQL connection failure");
//         console.error(error);
//         process.exit(1); // Exit the process with failure
//     }
// };

// module.exports = { connect };
