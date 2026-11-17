const tap = require('tap');
const supertest = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-for-tap';

const app = require('../src/app');
const server = supertest(app);

const organizer = {
  name: 'Test Organizer',
  email: 'organizer@test.com',
  password: 'password123',
  role: 'organizer',
};

const attendee = {
  name: 'Test Attendee',
  email: 'attendee@test.com',
  password: 'password123',
  role: 'attendee',
};

let organizerToken = '';
let attendeeToken = '';
let eventId = '';

// ── REGISTER ─────────────────────────────────────────────────────────────────

tap.test('POST /register - registers an organizer successfully', async (t) => {
  const res = await server.post('/register').send(organizer);
  t.equal(res.status, 201);
  t.hasOwnProp(res.body, 'token');
  t.equal(res.body.user.role, 'organizer');
  t.end();
});

tap.test('POST /register - registers an attendee successfully', async (t) => {
  const res = await server.post('/register').send(attendee);
  t.equal(res.status, 201);
  t.hasOwnProp(res.body, 'token');
  t.equal(res.body.user.role, 'attendee');
  t.end();
});

tap.test('POST /register - returns 409 for duplicate email', async (t) => {
  const res = await server.post('/register').send(organizer);
  t.equal(res.status, 409);
  t.end();
});

tap.test('POST /register - returns 400 when required fields are missing', async (t) => {
  const res = await server.post('/register').send({ name: 'No Email' });
  t.equal(res.status, 400);
  t.end();
});

tap.test('POST /register - returns 400 for invalid email format', async (t) => {
  const res = await server.post('/register').send({ name: 'Bad', email: 'notanemail', password: 'pass123' });
  t.equal(res.status, 400);
  t.end();
});

tap.test('POST /register - returns 400 when password is too short', async (t) => {
  const res = await server.post('/register').send({ name: 'Short', email: 'short@test.com', password: '123' });
  t.equal(res.status, 400);
  t.end();
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────

tap.test('POST /login - logs in organizer and returns token', async (t) => {
  const res = await server.post('/login').send({ email: organizer.email, password: organizer.password });
  t.equal(res.status, 200);
  t.hasOwnProp(res.body, 'token');
  t.equal(res.body.user.role, 'organizer');
  organizerToken = res.body.token;
  t.end();
});

tap.test('POST /login - logs in attendee and returns token', async (t) => {
  const res = await server.post('/login').send({ email: attendee.email, password: attendee.password });
  t.equal(res.status, 200);
  t.hasOwnProp(res.body, 'token');
  attendeeToken = res.body.token;
  t.end();
});

tap.test('POST /login - returns 401 for wrong password', async (t) => {
  const res = await server.post('/login').send({ email: organizer.email, password: 'wrongpassword' });
  t.equal(res.status, 401);
  t.end();
});

tap.test('POST /login - returns 401 for non-existent email', async (t) => {
  const res = await server.post('/login').send({ email: 'nobody@test.com', password: 'password123' });
  t.equal(res.status, 401);
  t.end();
});

tap.test('POST /login - returns 400 when email is missing', async (t) => {
  const res = await server.post('/login').send({ password: 'password123' });
  t.equal(res.status, 400);
  t.end();
});

// ── GET EVENTS (public) ────────────────────────────────────────────────────────

tap.test('GET /events - returns empty array when no events exist', async (t) => {
  const res = await server.get('/events');
  t.equal(res.status, 200);
  t.hasOwnProp(res.body, 'events');
  t.equal(res.body.events.length, 0);
  t.end();
});

// ── CREATE EVENT ──────────────────────────────────────────────────────────────

tap.test('POST /events - returns 401 without token', async (t) => {
  const res = await server.post('/events').send({ title: 'Event', description: 'Desc', date: '2026-08-01', time: '10:00' });
  t.equal(res.status, 401);
  t.end();
});

tap.test('POST /events - returns 403 for attendee (organizer only)', async (t) => {
  const res = await server
    .post('/events')
    .set('Authorization', `Bearer ${attendeeToken}`)
    .send({ title: 'Event', description: 'Desc', date: '2026-08-01', time: '10:00' });
  t.equal(res.status, 403);
  t.end();
});

tap.test('POST /events - organizer creates event successfully', async (t) => {
  const res = await server
    .post('/events')
    .set('Authorization', `Bearer ${organizerToken}`)
    .send({ title: 'Tech Conference', description: 'A tech event', date: '2026-08-01', time: '10:00', location: 'Karachi' });
  t.equal(res.status, 201);
  t.hasOwnProp(res.body, 'event');
  t.equal(res.body.event.title, 'Tech Conference');
  t.hasOwnProp(res.body.event, 'id');
  eventId = res.body.event.id;
  t.end();
});

tap.test('POST /events - returns 400 when required fields are missing', async (t) => {
  const res = await server
    .post('/events')
    .set('Authorization', `Bearer ${organizerToken}`)
    .send({ title: 'Incomplete' });
  t.equal(res.status, 400);
  t.end();
});

// ── GET EVENTS ────────────────────────────────────────────────────────────────

tap.test('GET /events - returns all events after creation', async (t) => {
  const res = await server.get('/events');
  t.equal(res.status, 200);
  t.equal(res.body.events.length, 1);
  t.end();
});

tap.test('GET /events/:id - returns specific event', async (t) => {
  const res = await server.get(`/events/${eventId}`);
  t.equal(res.status, 200);
  t.equal(res.body.event.id, eventId);
  t.equal(res.body.event.title, 'Tech Conference');
  t.end();
});

tap.test('GET /events/:id - returns 404 for unknown id', async (t) => {
  const res = await server.get('/events/non-existent-id');
  t.equal(res.status, 404);
  t.end();
});

// ── UPDATE EVENT ──────────────────────────────────────────────────────────────

tap.test('PUT /events/:id - organizer updates event successfully', async (t) => {
  const res = await server
    .put(`/events/${eventId}`)
    .set('Authorization', `Bearer ${organizerToken}`)
    .send({ title: 'Tech Conference 2026', location: 'Lahore' });
  t.equal(res.status, 200);
  t.equal(res.body.event.title, 'Tech Conference 2026');
  t.equal(res.body.event.location, 'Lahore');
  t.end();
});

tap.test('PUT /events/:id - returns 401 without token', async (t) => {
  const res = await server.put(`/events/${eventId}`).send({ title: 'No Auth' });
  t.equal(res.status, 401);
  t.end();
});

tap.test('PUT /events/:id - returns 403 for attendee', async (t) => {
  const res = await server
    .put(`/events/${eventId}`)
    .set('Authorization', `Bearer ${attendeeToken}`)
    .send({ title: 'Should fail' });
  t.equal(res.status, 403);
  t.end();
});

tap.test('PUT /events/:id - returns 404 for non-existent event', async (t) => {
  const res = await server
    .put('/events/non-existent-id')
    .set('Authorization', `Bearer ${organizerToken}`)
    .send({ title: 'Ghost Event' });
  t.equal(res.status, 404);
  t.end();
});

// ── REGISTER FOR EVENT ────────────────────────────────────────────────────────

tap.test('POST /events/:id/register - returns 401 without token', async (t) => {
  const res = await server.post(`/events/${eventId}/register`);
  t.equal(res.status, 401);
  t.end();
});

tap.test('POST /events/:id/register - attendee registers successfully', async (t) => {
  const res = await server
    .post(`/events/${eventId}/register`)
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 201);
  t.end();
});

tap.test('POST /events/:id/register - returns 409 for duplicate registration', async (t) => {
  const res = await server
    .post(`/events/${eventId}/register`)
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 409);
  t.end();
});

tap.test('POST /events/:id/register - returns 400 if organizer registers own event', async (t) => {
  const res = await server
    .post(`/events/${eventId}/register`)
    .set('Authorization', `Bearer ${organizerToken}`);
  t.equal(res.status, 400);
  t.end();
});

tap.test('POST /events/:id/register - returns 404 for non-existent event', async (t) => {
  const res = await server
    .post('/events/non-existent-id/register')
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 404);
  t.end();
});

// ── GET PARTICIPANTS ──────────────────────────────────────────────────────────

tap.test('GET /events/:id/participants - organizer views participants', async (t) => {
  const res = await server
    .get(`/events/${eventId}/participants`)
    .set('Authorization', `Bearer ${organizerToken}`);
  t.equal(res.status, 200);
  t.hasOwnProp(res.body, 'participants');
  t.equal(res.body.count, 1);
  t.end();
});

tap.test('GET /events/:id/participants - returns 403 for non-organizer', async (t) => {
  const res = await server
    .get(`/events/${eventId}/participants`)
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 403);
  t.end();
});

tap.test('GET /events/:id/participants - returns 401 without token', async (t) => {
  const res = await server.get(`/events/${eventId}/participants`);
  t.equal(res.status, 401);
  t.end();
});

// ── UNREGISTER FROM EVENT ─────────────────────────────────────────────────────

tap.test('DELETE /events/:id/register - attendee unregisters successfully', async (t) => {
  const res = await server
    .delete(`/events/${eventId}/register`)
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 200);
  t.end();
});

tap.test('DELETE /events/:id/register - returns 404 when not registered', async (t) => {
  const res = await server
    .delete(`/events/${eventId}/register`)
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 404);
  t.end();
});

// ── DELETE EVENT ──────────────────────────────────────────────────────────────

tap.test('DELETE /events/:id - returns 401 without token', async (t) => {
  const res = await server.delete(`/events/${eventId}`);
  t.equal(res.status, 401);
  t.end();
});

tap.test('DELETE /events/:id - returns 403 for attendee', async (t) => {
  const res = await server
    .delete(`/events/${eventId}`)
    .set('Authorization', `Bearer ${attendeeToken}`);
  t.equal(res.status, 403);
  t.end();
});

tap.test('DELETE /events/:id - organizer deletes event successfully', async (t) => {
  const res = await server
    .delete(`/events/${eventId}`)
    .set('Authorization', `Bearer ${organizerToken}`);
  t.equal(res.status, 200);
  t.end();
});

tap.test('DELETE /events/:id - returns 404 for already deleted event', async (t) => {
  const res = await server
    .delete(`/events/${eventId}`)
    .set('Authorization', `Bearer ${organizerToken}`);
  t.equal(res.status, 404);
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
