const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', authRoutes);
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Event Management API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    error: err.message,
    path: req.path,
    method: req.method,
  });
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
