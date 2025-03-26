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
const udRoutes = require("./routes/userdetailsRoutes");

app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", udRoutes);

const PORT = process.env.PORT || 5109;
app.listen(PORT, () => console.log(`Admin panel running at: http://localhost:${PORT}`));