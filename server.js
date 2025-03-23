// backend/server.js
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));



// Session store 
const sessionStoreOptions = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};
const sessionStore = new MySQLStore(sessionStoreOptions);
app.use(session({
  key: 'moviedb_session',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false 
  }
}));

//taking the local storage to the server under movie_posters
app.use('/grid_images', express.static('uploads/grid_images'));
app.use('/theme_images', express.static('uploads/theme_images'));


const authRoutes = require('./routes/auth');
app.use('/', authRoutes);
const movieRoutes = require('./routes/movie');
app.use('/', movieRoutes);
const movieFilterRoutes = require('./routes/movie_filters');
app.use('/', movieFilterRoutes);
const toggleRoutes = require('./routes/toggle');
app.use('/', toggleRoutes);
const reviewRoutes = require('./routes/review');
app.use('/', reviewRoutes);





app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Movie Catalog API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.BACKEND_URL}`);
});