const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes/index");
// Import the connectDB function
const connectDB = require("./config/db");

// Load environment variables from the .env file located in the config directory
require("dotenv").config({ path: "./config/.env" });

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed methods
    credentials: true, // Allow credentials like cookies and headers
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
