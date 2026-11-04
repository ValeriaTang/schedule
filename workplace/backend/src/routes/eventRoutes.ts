import { Hono } from 'hono'
import { Env } from '../types/hono'
import { authCheck } from '../middleware/authMiddleware'
import { rejectDemoWrite, rejectDemoReadSensitive } from '../middleware/demoGuard'
import { EventController } from '../controllers/eventController'
import { createEventSchema, updateEventSchema } from '../validators/eventValidators'
import { requireJsonContentType } from '../middleware/requestSecurity'

const eventRoutes = new Hono<Env>()

// GET  /api/events/
eventRoutes.get('/', authCheck, EventController.getByGroup)

// POST /api/events/
eventRoutes.post('/', requireJsonContentType, authCheck, rejectDemoWrite, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = createEventSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message)
    return c.json({ errors }, 400)
  }

  return EventController.create(c, result.data)
})

// PUT /api/events/:id  <-- 追加
eventRoutes.put('/:id', requireJsonContentType, authCheck, rejectDemoWrite, async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = updateEventSchema.safeParse(body)

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message)
    return c.json({ errors }, 400)
  }

  return EventController.update(c, result.data)
})

// DELETE /api/events/:id
eventRoutes.delete('/:id', authCheck, rejectDemoWrite, EventController.delete)

export default eventRoutes