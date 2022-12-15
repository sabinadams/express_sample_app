import { Router } from "express";
const router = Router()
import validate from 'middlewares/validate.middleware'
import * as AuthController from 'controllers/auth.controller'

import { SignupSchema, SigninSchema } from 'validation/request.schemas'

router.post('/signup', validate(SignupSchema), AuthController.signup)
router.post('/signin', validate(SigninSchema), AuthController.signin)

export default router