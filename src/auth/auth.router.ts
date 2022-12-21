import * as AuthController from './auth.controller'
import { SigninSchema, SignupSchema } from './auth.schemas'
import { Router } from 'express'
import { validate } from 'lib/middlewares'

const router = Router()

router.post('/signup', validate(SignupSchema), AuthController.signup)
router.post('/signin', validate(SigninSchema), AuthController.signin)

export default router
