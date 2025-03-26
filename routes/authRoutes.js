const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");
const router = express.Router();



const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
      return next(); // User is authenticated, proceed
  }
  res.redirect("/login"); // Redirect to login if not authenticated
};



// Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});






// Register User API
router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
   
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    await db.query("INSERT INTO users (email, username, password,role) VALUES (?, ?, ?,'admin')", [
      email,
      username,
      hashedPassword
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
});






router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.user = { id: user.id, email: user.email, username: user.username,role:'admin' };

    res.json({ 
      message: "Login successful", 
      user: req.session.user 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging in" });
  }
});


router.get("/dashboard", isAuthenticated,(req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }
  res.render("dashboard", { user: req.session.user });
});


router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Error logging out" });
        }
        res.clearCookie("connect.sid"); // Clear session cookie
        res.redirect("/"); // Redirect to logout page
    });
});


module.exports = router;
