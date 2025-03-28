const express = require("express");
const router = express.Router();
const db = require("../config/db");

//************************************************************************************** */
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next(); // User is authenticated, proceed
    }
    res.redirect("/login"); // Redirect to login if not authenticated
  };
//************************************************************************************** */



router.get("/view-users",isAuthenticated, async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, username, email,role FROM users");
        res.render('userAnalytics', {
            users,
            currentUser: req.session.user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching users");
    }
});


//************************************************************************************** */
// Delete user by ID
router.delete("/users/delete/:id", isAuthenticated,async (req, res) => {
    const userId = req.params.id;

    try {
        // Check if the user is an admin
        const [user] = await db.execute("SELECT role FROM users WHERE id = ?", [userId]);

        if (!user.length) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user[0].role === "admin") {
            return res.status(403).json({ message: "Admin cannot delete himself!" });
        }

        // Delete the user
        await db.execute("DELETE FROM users WHERE id = ?", [userId]);

        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
//************************************************************************************** */

module.exports = router;
