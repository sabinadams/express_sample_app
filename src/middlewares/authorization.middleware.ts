import type { NextFunction, Request, Response } from 'express'
import { AppError } from 'lib/utility-classes'
import { validateJWT } from 'services/auth.service'

export default (
  request: Request<unknown>,
  response: Response,
  next: NextFunction
) => {
  if (request.method === 'OPTIONS')
    return response.send({ message: 'Preflight check successful.' })

  if (!request.headers.authorization) {
    return next(
      new AppError('unauthorized', '`Authorization` header is required.')
    )
  }

  if (!request.headers.authorization.startsWith('Bearer ')) {
    return next(new AppError('unauthorized', 'Invalid access token.'))
  }

  const token = request.headers.authorization.split(' ')[1].trim()

  if (!token) {
    return next(new AppError('unauthorized', 'Invalid access token.'))
  }

  try {
    request['session'] = { userId: validateJWT(token) }
    next()
  } catch (e) {
    return next(new AppError('validation', 'Invalid access token.'))
  }
}
