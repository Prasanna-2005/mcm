require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const session = require("express-session");

app.use(session({
  secret: "12345",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/", homeRoutes);
app.use("/", authRoutes);

const PORT = process.env.PORT || 5123;
app.listen(PORT, () => console.log(`Admin panel running at: http://localhost:${PORT}`));