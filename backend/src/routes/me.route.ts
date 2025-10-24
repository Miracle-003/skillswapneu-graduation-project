import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { getMe, updateMe } from '../controllers/me.controller'

const router = Router()

router.get('/', requireAuth, getMe)
router.put('/', requireAuth, updateMe)

export default router
