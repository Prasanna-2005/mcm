require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Database connection
const pool = mysql
    .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
    })
    .promise();

// Routes

// Render Home Page
app.get('/', (req, res) => {
    res.render('index');
});

// Render Register Page
app.get('/register', (req, res) => {
    res.render('register');
});

// Register User
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, email, password,role) VALUES (?, ?, ?,"admin")',
            [username, email, hashedPassword]
        );
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// Render Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT id, username, email, password FROM users WHERE email = ?', [email]);
        if (users.length > 0 && (await bcrypt.compare(password, users[0].password))) {
            req.session.user = { id: users[0].id, username: users[0].username, email: users[0].email };
            return res.redirect('/dashboard');
        }
        res.status(401).send('Invalid credentials');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});


app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Admin Server running on port ${PORT}`);
});
