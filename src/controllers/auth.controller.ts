import type { Request, RequestHandler } from 'express'
import { AppError } from 'lib/utility-classes'
import * as AuthService from 'services/auth.service'
import type { SigninSchema, SignupSchema } from 'validation/request.schemas'

export const signup: RequestHandler = async (
  req: Request<unknown, unknown, SignupSchema>,
  res,
  next
) => {
  const userData = {
    username: req.body.username,
    password: req.body.password
  }

  if (await findUserByUsername(userData.username)) {
    return next(
      new AppError('validation', 'A user already exists with that username')
    )
  }

  const newUser = await createUser(userData)
  const token = generateJWT(newUser.id)

  res.status(200).json({
    message: `Registered successfully`,
    user: newUser,
    token
  })
}

export const signin: RequestHandler = async (
  req: Request<unknown, unknown, SigninSchema>,
  res,
  next
) => {
  const { username, password } = req.body

  const existing = await AuthService.findUserByUsername(username)

  if (!existing) {
    return next(new AppError('validation', 'Account not found.'))
  }

  if (!AuthService.comparePasswords(password, existing.password)) {
    return next(new AppError('validation', 'Invalid login.'))
  }

  const token = AuthService.generateJWT(existing.id)

  res.status(200).json({
    message: 'Login successful!',
    username: existing.username,
    token
  })
}
