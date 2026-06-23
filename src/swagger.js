const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Event Management API',
    version: '1.0.0',
    description: 'RESTful backend for a virtual event management platform with user auth, event scheduling, and participant management.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['organizer', 'attendee'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date' },
          time: { type: 'string', example: '10:00' },
          location: { type: 'string', nullable: true },
          participants: { type: 'array', items: { $ref: '#/components/schemas/Participant' } },
          organizerId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Participant: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          registeredAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: { message: { type: 'string' } },
      },
    },
  },
  paths: {
    '/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Creates a user account, returns a JWT token, and fires an async welcome email notification.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Nabil Organizer' },
                  email: { type: 'string', format: 'email', example: 'baigny@gmail.com' },
                  password: { type: 'string', minLength: 6, example: 'Admin@123' },
                  role: { type: 'string', enum: ['organizer', 'attendee'], default: 'attendee' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'baigny@gmail.com' },
                  password: { type: 'string', example: 'Admin@123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } } },
          400: { description: 'Validation error' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Auth'],
        summary: 'List all users (no passwords)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of users', content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' }, users: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/events': {
      get: {
        tags: ['Events'],
        summary: 'Get all events (public)',
        responses: {
          200: { description: 'List of events', content: { 'application/json': { schema: { type: 'object', properties: { events: { type: 'array', items: { $ref: '#/components/schemas/Event' } } } } } } },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Create a new event (organizer only)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'date', 'time'],
                properties: {
                  title: { type: 'string', example: 'Tech Conference 2026' },
                  description: { type: 'string', example: 'A conference for developers' },
                  date: { type: 'string', format: 'date', example: '2026-08-15' },
                  time: { type: 'string', example: '10:00' },
                  location: { type: 'string', example: 'Hyderabad, India' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Event created', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, event: { $ref: '#/components/schemas/Event' } } } } } },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Organizers only' },
        },
      },
    },
    '/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get a single event (public)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Event found', content: { 'application/json': { schema: { type: 'object', properties: { event: { $ref: '#/components/schemas/Event' } } } } } },
          404: { description: 'Event not found' },
        },
      },
      put: {
        tags: ['Events'],
        summary: 'Update an event (owner organizer only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  time: { type: 'string' },
                  location: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Event updated' },
          401: { description: 'Unauthorized' },
          403: { description: 'Not the event owner' },
          404: { description: 'Event not found' },
        },
      },
      delete: {
        tags: ['Events'],
        summary: 'Delete an event (owner organizer only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Event deleted' },
          401: { description: 'Unauthorized' },
          403: { description: 'Not the event owner' },
          404: { description: 'Event not found' },
        },
      },
    },
    '/events/{id}/register': {
      post: {
        tags: ['Participants'],
        summary: 'Register for an event (attendee only)',
        description: 'Registers the authenticated attendee for an event and fires an async email notification.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          201: { description: 'Registered successfully' },
          400: { description: 'Organizer cannot register for own event' },
          401: { description: 'Unauthorized' },
          404: { description: 'Event not found' },
          409: { description: 'Already registered' },
        },
      },
      delete: {
        tags: ['Participants'],
        summary: 'Unregister from an event',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Unregistered successfully' },
          401: { description: 'Unauthorized' },
          404: { description: 'Event not found or not registered' },
        },
      },
    },
    '/events/{id}/participants': {
      get: {
        tags: ['Participants'],
        summary: 'View participant list (owner organizer only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Participant list', content: { 'application/json': { schema: { type: 'object', properties: { count: { type: 'integer' }, participants: { type: 'array', items: { $ref: '#/components/schemas/Participant' } } } } } } },
          401: { description: 'Unauthorized' },
          403: { description: 'Not the event owner' },
          404: { description: 'Event not found' },
        },
      },
    },
  },
};

module.exports = swaggerDefinition;
