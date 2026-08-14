import { Hono } from 'hono'
import { AuthController } from '../controllers/AuthController.ts'

const authRoutes = new Hono()

// POST /api/auth/signup
authRoutes.post('/signup', AuthController.signup)

// POST /api/auth/login
authRoutes.post('/login', AuthController.login)

export default authRoutes