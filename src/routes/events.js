const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeOrganizer } = require('../middleware/auth');
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventsController');

const router = express.Router();

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Valid time is required (HH:MM)'),
  body('location').optional().trim(),
];

const updateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().isISO8601().toDate().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Valid time is required (HH:MM)'),
  body('location').optional().trim(),
];

// Authenticated users can read events
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEvent);

// Organizers only for write operations
router.post('/', authenticate, authorizeOrganizer, createValidation, createEvent);
router.put('/:id', authenticate, authorizeOrganizer, updateValidation, updateEvent);
router.delete('/:id', authenticate, authorizeOrganizer, deleteEvent);

module.exports = router;
