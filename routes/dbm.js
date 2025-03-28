const express = require("express");
const router = express.Router();
const db = require("../config/db"); 



router.get("/db-manager", async (req, res) => {
    try {
        const [tables] = await db.query("SHOW TABLES");
        res.render("dbm", { tables: tables.map(t => Object.values(t)[0]) });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching tables");
    }
});

router.get('/get-tables', async (req, res) => {
    try {
        const [rows] = await db.query("SHOW TABLES");
        const tables = rows.map(row => Object.values(row)[0]);
        res.json({ tables });
    } catch (error) {
        res.status(500).json({ error: "Error fetching tables" });
    }
});


router.post('/get-table-data', async (req, res) => {
    try {
        const { tables } = req.body;
        if (!tables || tables.length === 0) return res.status(400).json({ error: "No tables selected" });

        let result = [];
        for (let table of tables) {
            const [columns] = await db.query(`SHOW COLUMNS FROM ${table}`);
            const excludeSorting = ["watchlists", "user_favorites", "movie_genres"];
            const orderByClause = excludeSorting.includes(table) ? "" : "ORDER BY id";
            const [rows] = await db.query(`SELECT * FROM ${table} ${orderByClause} LIMIT 50`);
            
            result.push({
                table,
                columns: columns.map(col => col.Field),
                rows
            });
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Error fetching table data" });
    }
});

module.exports = router;
