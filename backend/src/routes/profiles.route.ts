import { Router } from 'express'
import { listProfiles, getProfile } from '../controllers/profiles.controller'

const router = Router()

router.get('/', listProfiles)
router.get('/:id', getProfile)

export default router
