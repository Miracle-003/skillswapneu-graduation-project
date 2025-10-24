import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getAuthMe } from '../controllers/auth.controller'

const router = Router()

router.get('/me', requireAuth, getAuthMe)

export default router
