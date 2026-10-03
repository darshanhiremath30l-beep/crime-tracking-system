const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "live_tracking"
});

// Route to get live vehicle positions
app.get("/vehicles", (req, res) => {
    db.query("SELECT * FROM vehicles", (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});