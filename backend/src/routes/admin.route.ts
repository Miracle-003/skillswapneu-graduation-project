import { Router } from 'express'
import { requireAdmin } from '../middleware/admin'
import { listAuthUsers, getAuthUser } from '../controllers/admin-users.controller'

const router = Router()

router.get('/auth-users', requireAdmin, listAuthUsers)
router.get('/auth-users/:id', requireAdmin, getAuthUser)

export default router
