const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Adjust based on your setup

// Get all genres - render the EJS template
router.get("/", async (req, res) => {
  try {
    const [genres] = await db.query("SELECT * FROM genres ORDER BY name");
    res.render("genres", { genres });
  } catch (err) {
    res.status(500).send("Error fetching genres: " + err.message);
  }
});

// Add a new genre
router.post("/add", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Genre name is required" });

  try {
    const [result] = await db.query("INSERT INTO genres (name) VALUES (?)", [
      name,
    ]);
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(400).json({ error: "Genre already exists or invalid input" });
  }
});

// Delete a genre
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM genres WHERE id = ?", [id]);
  res.json({ success: true });
});

module.exports = router;
