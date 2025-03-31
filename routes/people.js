const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Adjust based on your setup

// Get all people - render the EJS template
router.get("/", async (req, res) => {
  try {
    const [people] = await db.query("SELECT * FROM people ORDER BY name");
    res.render("people", { people });
  } catch (err) {
    res.status(500).send("Error fetching people: " + err.message);
  }
});

// Search for people
router.get("/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json([]);

  try {
    const [people] = await db.query(
      "SELECT * FROM people WHERE name LIKE ? ORDER BY name LIMIT 10",
      [`%${query}%`]
    );
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: "Error searching for people" });
  }
});

// Add a new person
router.post("/add", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Person name is required" });

  try {
    const [result] = await db.query("INSERT INTO people (name) VALUES (?)", [
      name,
    ]);
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(400).json({ error: "Person already exists or invalid input" });
  }
});

// Delete a person
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM people WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res
      .status(400)
      .json({
        error: "Cannot delete person. They might be referenced in movies.",
      });
  }
});

module.exports = router;
