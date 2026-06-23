# Event Management API

A RESTful backend for a virtual event management platform. Supports user registration, event scheduling, and participant management using in-memory data structures.

## Tech Stack

- Node.js (≥ 18) · Express.js · bcryptjs · JWT · express-validator

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env with your JWT secret
echo JWT_SECRET=your_secret_here > .env

# 3. Start server
npm start
```

**.env variables:**

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `PORT` | No | Server port (default: 3000) |

> **Note:** Data is stored in-memory. All users and events reset on server restart — by design per project requirements.
>
> **Email notifications** are simulated asynchronously via `console.log` — no SMTP setup required.

## API Endpoints

Base URL: `http://localhost:3000`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | Login and receive a JWT |
| GET | `/users` | Authenticated | List all users |

**Register body:**
```json
{
  "name": "Nabil Organizer",
  "email": "baigny@gmail.com",
  "password": "Admin@123",
  "role": "organizer"
}
```
> `role` accepts `"organizer"` or `"attendee"` (default: `"attendee"`)

**Login body:**
```json
{
  "email": "baigny@gmail.com",
  "password": "Admin@123"
}
```
> Copy the `token` from the response and use it as `Authorization: Bearer <token>` on protected routes.

### Events

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/events` | Public | List all events |
| GET | `/events/:id` | Public | Get a single event |
| POST | `/events` | Organizer | Create an event |
| PUT | `/events/:id` | Organizer (owner) | Update an event |
| DELETE | `/events/:id` | Organizer (owner) | Delete an event |

**Create / Update event body:**
```json
{
  "title": "Tech Conference 2026",
  "description": "A conference for developers",
  "date": "2026-08-15",
  "time": "10:00",
  "location": "Hyderabad, India"
}
```
> `date`: `YYYY-MM-DD` · `time`: `HH:MM` (24-hour) · `location`: optional

### Participants

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/events/:id/register` | Attendee | Register for an event |
| DELETE | `/events/:id/register` | Attendee | Unregister from an event |
| GET | `/events/:id/participants` | Organizer (owner) | View participant list |

## Postman Collection

[![Run in Postman](https://run.pstmn.io/button.svg)](https://universal-sunset-220568.postman.co/workspace/Exploring-APIs~4290d2d8-ca86-4d7b-a7c6-115807f58037/collection/1081433-e64964b3-b580-48e7-96fb-4c34a5146c25)

Set environment variable `base_url = http://localhost:3000`, then run requests top-to-bottom — tokens and `event_id` are set automatically.

## Testing

```bash
npm test
```

37 tests covering all endpoints — no database or `.env` required.

## Project Structure

```
├── src/
│   ├── controllers/    # Business logic
│   ├── data/store.js   # In-memory users & events arrays
│   ├── middleware/     # JWT auth & role checks
│   ├── routes/         # Express routers
│   └── utils/          # Email service
├── test/app.test.js    # TAP + Supertest test suite
├── index.js            # Entry point
└── .env.example
```
