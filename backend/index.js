require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoute");

// Import app & server (socket.io setup)
const { app, server } = require("./sokcetIO/server");

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

app.use(cors({
    origin: true, // allow all origins (for production)
    credentials: true
}));

app.use(cookieParser());

// Routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", messageRoutes);

// -------------------- FRONTEND DEPLOYMENT --------------------
if (process.env.NODE_ENV === "production") {
    const dirPath = path.resolve();

    // Serve static frontend files
    app.use(express.static(path.join(dirPath, "frontend/dist")));

    // Handle all routes (React/Vite)
    app.get("*", (req, res) => {
        res.sendFile(
            path.join(dirPath, "frontend/dist", "index.html")
        );
    });
}
// -------------------------------------------------------------

// Database connection
const dbConnect = require("./config/database");
dbConnect();

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});