const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { users } = require('../data/store');
const { sendWelcomeEmail } = require('../utils/emailService');

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, password, role } = req.body;
  const email = req.body.email.toLowerCase().trim();

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: uuidv4(),
    name: name.trim(),
    email,
    password: hashedPassword,
    role: role === 'organizer' ? 'organizer' : 'attendee',
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  sendWelcomeEmail(user).catch((err) =>
    console.error('Welcome email failed:', err.message)
  );

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const email = req.body.email.toLowerCase().trim();
  const { password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

module.exports = { register, login };
