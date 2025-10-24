import { Router } from 'express'
import meRouter from './me.route'
import profilesRouter from './profiles.route'
import authRouter from './auth.route'
import usersRouter from './users.route'
import adminRouter from './admin.route'

const router = Router()

router.use('/auth', authRouter)
router.use('/me', meRouter)
router.use('/profiles', profilesRouter)
router.use('/users', usersRouter)
router.use('/admin', adminRouter)

export default router
