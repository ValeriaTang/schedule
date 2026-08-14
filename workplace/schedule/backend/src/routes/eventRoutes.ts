import { Hono } from 'hono'
import { EventController } from '../controllers/eventController'

const eventRoutes = new Hono()

// GET  /api/events/
eventRoutes.get('/', EventController.getEvents)

// POST /api/events/
eventRoutes.post('/', EventController.createEvent)

// DELETE /api/events/:id
eventRoutes.delete('/:id', EventController.deleteEvent)

export default eventRoutes