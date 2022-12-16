import * as AuthController from 'controllers/auth.controller'
import { Router } from 'express'
import validate from 'middlewares/validate.middleware'
import { SigninSchema, SignupSchema } from 'validation/request.schemas'

const router = Router()

router.post('/signup', validate(SignupSchema), AuthController.signup)
router.post('/signin', validate(SigninSchema), AuthController.signin)

export default router
