const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { events } = require('../data/store');

const createEvent = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, date, time, location } = req.body;

  const event = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    date,
    time,
    location: location ? location.trim() : null,
    participants: [],
    organizerId: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  events.push(event);

  res.status(201).json({ message: 'Event created successfully', event });
};

const getEvents = (req, res) => {
  res.json({ events });
};

const getEvent = (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json({ event });
};

const updateEvent = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const event = events.find((e) => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (event.organizerId !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to update this event' });
  }

  const { title, description, date, time, location } = req.body;

  if (title !== undefined) event.title = title.trim();
  if (description !== undefined) event.description = description.trim();
  if (date !== undefined) event.date = date;
  if (time !== undefined) event.time = time;
  if (location !== undefined) event.location = location ? location.trim() : null;
  event.updatedAt = new Date().toISOString();

  res.json({ message: 'Event updated successfully', event });
};

const deleteEvent = (req, res) => {
  const index = events.findIndex((e) => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (events[index].organizerId !== req.user.id) {
    return res.status(403).json({ message: 'You are not authorized to delete this event' });
  }

  events.splice(index, 1);

  res.json({ message: 'Event deleted successfully' });
};

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
