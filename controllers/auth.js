const db = require('../config/db.config');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { username, email, password, admin } = req.body;
    

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Determine role based on admin code
    let role = 'user';
    if (admin && admin === process.env.ADMIN_CODE) {
      role = 'admin';
    }
    
    // Create new user with role
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    
    if (result.affectedRows === 1) {
      return res.status(201).json({ 
        message: 'User registered successfully', 
        role: role 
      });
    } else {
      return res.status(500).json({ message: 'Failed to register user' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};





exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Store user info in session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    req.session.isLoggedIn = true;
    
    return res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    
    res.clearCookie('moviedb_session');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};




exports.getProfile = async (req, res) => {
  try {
    
    const [users] = await db.query(
      'SELECT id, username, email,role FROM users WHERE id = ?', 
      [req.session.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(users[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};



exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};